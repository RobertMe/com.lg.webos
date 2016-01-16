"use strict";

var webos		= require('webos');

var self = module.exports = {
	
	init: function() {

		self.tvs = {};
		self.devices = [];
		
		self.scanner = new webos.Scanner();			
		self.scanner.startScanning();
		self.scanner.on('device', function(device){
			console.log('Found device', device.uuid, device.address)
			self.devices.push(device);
		})
				
		Homey.log("LG webOS for Homey is ready!");
		
		Homey.manager('flow').on('action.set_channel', function( callback, args ){
			
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setChannel( args.channel.id, callback );
			
		});
		
		Homey.manager('flow').on('action.set_channel.channel.autocomplete', function( callback, args ){

			if( typeof args.tv == 'undefined' ) return callback( "Select a TV" );
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );
			
			tv.getChannels(function( err, channels ){
				if( err ) return callback( err );
				
				channels = channels.map(function(channel){
					return {
						name	: channel.number + '. ' + channel.name,
						id		: channel.id
					}
				})
				
				channels = channels.filter(function(channel){
					return channel.name.toLowerCase().indexOf(args.query.toLowerCase()) > -1;
				})
								
				callback( null, channels );
				
			})
						
			/*
			Homey.lgtv.channellist(function( err, channels ){
				
				channels = channels.map(function(channel){
					return {
						id: channel.id,
						name: channel.name
					}
				})
				
				callback(channels);
			})
			*/
			
		})
				
	}
}