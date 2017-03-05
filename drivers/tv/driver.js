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

				var deviceObj = false;
				Homey.app.devices.forEach(function(device_){
					if( device_.friendlyName == device.data.id ) deviceObj = device_;
				})

				module.exports.setUnavailable( device.data, "Offline" );

				connectToDevice( deviceObj, device.data, function( err, tv ){
					if( err ) return Homey.error(err);
					tv.showFloat( "This TV is now connected to Homey!" );
				});

				callback( null, true );

			})


	}

}

function connectToDevice( device, device_data, callback ) {

	Homey.log("connectToDevice", device, device_data);

	callback = callback || function(){}

	// map friendlyName to IP
	var ip = false;
	Homey.app.devices.forEach(function(device_){
		if( device_.friendlyName == device_data.id ) ip = device_.address;
	})

	if( ip ) {

		var tv = Homey.app.tvs[ device_data.id ] = new webos.Remote({
			reconnectFromStart	: true,
			address				: device.address,
			key					: device_data.key,
			debug				: false
		})

		Homey.app.tvs[ device_data.id ].connect({}, function( err, result ){
			if( err ) return callback( err );
			module.exports.setAvailable( device_data );

			Homey.app.tvs[ device_data.id ].on('disconnect', function(){
				Homey.log("TV Disconnected");
				module.exports.setUnavailable( device_data, "Offline" );
			})

			Homey.app.tvs[ device_data.id ].on('reconnect', function(){
				Homey.log("TV Reconnected");
				module.exports.setAvailable( device_data );
			})

			callback( null, tv );
		});

	}

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
