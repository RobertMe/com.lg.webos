"use strict";

var webos		= require('webos');

var self = module.exports = {
	
	init: function( devices_data, callback ) {
		
		devices_data.forEach(function(device_data){
			module.exports.setUnavailable( device_data, "Offline" );
		})
		
		Homey.app.scanner.on('device', function(device){
		
			devices_data.forEach(function(device_data){
			
				connectToDevice( device, device_data );
				
			});
						
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
					if( device_.uuid == device.data.id ) deviceObj = device_;
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
	
	callback = callback || function(){}
				
	// map uuid to IP
	var ip = false;
	Homey.app.devices.forEach(function(device_){
		if( device_.uuid == device_data.id ) ip = device_.address;
	})
	
	if( ip ) {
		
		var tv = Homey.app.tvs[ device_data.id ] = new webos.Remote()
		
		Homey.app.tvs[ device_data.id ].connect({
			address	: device.address,
			key		: device_data.key
		}, function( err, result ){
			if( err ) return callback( err );
			module.exports.setAvailable( device_data );	
			callback( null, tv );								
		});
		
	}
	
}

function formatDevice( device ) {
	return {
		name: 'LG webOS (' + device.uuid + ')',
		data: {
			id: device.uuid,
			ip: device.address
		}
	}
}