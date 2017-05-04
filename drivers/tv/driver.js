"use strict";

var webos		= require('webos');

var self = module.exports = {

	init: function( devices_data, callback ) {

		devices_data.forEach(function(device_data){
			Homey.app.devices[device_data.id] = device_data;
		})

		callback( true );
	},

	deleted: function( device_data ) {

		var tv = Homey.app.tvs[ device_data.id ];
		if( tv ) {
			tv.disconnect();
		}

		delete Homey.app.tvs[ device_data.id ];
	},

	pair: function( socket ) {

		socket
			.on('list_devices', function( data, callback ){

				callback( null, Homey.app.devices.map(formatDevice) );

				// when a new device has been found
				Homey.app.scanner.on('device', function(device){
						socket.emit('list_devices', [ formatDevice(device) ])
				})

			})
			.on('handshake', function( device, callback ){

				var remote = new webos.Remote();
					remote.connect({
							address : device.data.ip
					}, callback)

			})
			.on('add_device', function( device, callback ){

				Homey.app.connectToDevice( device.data, function( err, tv ){
					if( err ) return Homey.error(err);
					tv.showFloat( "This TV is now connected to Homey!" );
				});

				callback( null, true );

			})
	},

}

function formatDevice( device ) {
	return {
		name: device.friendlyName,
		data: {
			id: device.friendlyName,
			ip: device.address
		}
	}
}
