"use strict";

var webos		= require('webos');

var self = module.exports = {
	
	init: function() {

		self.tvs = {};
		self.devices = [];
		
		self.scanner = new webos.Scanner();		
		self.scanner.on('device', function(device){
			Homey.log('Found device', device.friendlyName, device.address)
			self.devices.push(device);
		})
		self.scanner.startScanning();
		
		setInterval(function(){
			self.scanner.startScanning();
		}, 10000);
				
		Homey.log("LG webOS for Homey is ready!");
		
		/*
			TV channel
		*/
				
		Homey.manager('flow').on('action.set_channel', function( callback, args ){
			
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setChannel( args.channel.id, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
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
			
		});
		
		/*
			TV input
		*/
				
		Homey.manager('flow').on('action.set_input', function( callback, args ){
			
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setInput( args.input.id, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
		
		Homey.manager('flow').on('action.set_input.input.autocomplete', function( callback, args ){

			if( typeof args.tv == 'undefined' ) return callback( "Select a TV" );
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );
			
			tv.getInputs(function( err, inputs ){
				if( err ) return callback( err );
								
				inputs = inputs.map(function(input){
					return {
						name	: input.label,
						id		: input.id
					}
				})
				
				inputs = inputs.filter(function(input){
					return input.name.toLowerCase().indexOf(args.query.toLowerCase()) > -1;
				})
								
				callback( null, inputs );
				
			});
			
		});
		
		/*
			TV volume
		*/
				
		Homey.manager('flow').on('action.set_volume', function( callback, args ){
						
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setVolume( args.volume, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
				
		Homey.manager('flow').on('action.set_mute_true', function( callback, args ){
						
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setMute( true, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
				
		Homey.manager('flow').on('action.set_mute_false', function( callback, args ){
						
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.setMute( false, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
		
		/*
			Misc
		*/
				
		Homey.manager('flow').on('action.show_float', function( callback, args ){
												
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
						
			tv.showFloat( args.message, function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
				
		Homey.manager('flow').on('action.poweroff', function( callback, args ){
						
			var tv = self.tvs[ args.tv.id ];
			if( typeof tv == 'undefined' ) return callback( "TV not connected" );	
			
			tv.turnOff( function(err, result){
				if( err ) return callback(err);
				return callback( null, result.returnValue );
			});
			
		});
				
	}
}