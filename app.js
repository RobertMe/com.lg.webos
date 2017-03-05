"use strict";

var webos		= require('webos');

var self = module.exports = {

	init: function() {

    // List of online TV's
		self.tvs = {};
		// List of paired devices
		self.devices = {}

		Homey.log("LG webOS for Homey is ready!");

		/*
			TV channel
		*/

		Homey.manager('flow').on('action.set_channel', function( callback, args ){

      self.retrieveTV( args.args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.setChannel( args.channel.id, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});

		Homey.manager('flow').on('action.set_channel.channel.autocomplete', function( callback, args ){

			if( typeof args.args.tv == 'undefined' ) return callback( "Select a TV" );

      self.retrieveTV( args.args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

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

        });
      });
		});

		/*
			TV input
		*/

		Homey.manager('flow').on('action.set_input', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.setInput( args.input.id, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
			});
		});

		Homey.manager('flow').on('action.set_input.input.autocomplete', function( callback, args ){

			if( typeof args.args.tv == 'undefined' ) return callback( "Select a TV" );

      self.retrieveTV( args.args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

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
		});

		/*
			TV volume
		*/

		Homey.manager('flow').on('action.set_volume', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.setVolume( args.volume, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});

		Homey.manager('flow').on('action.set_mute_true', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.setMute( true, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});

		Homey.manager('flow').on('action.set_mute_false', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.setMute( false, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});

		/*
			Misc
		*/

		Homey.manager('flow').on('action.show_float', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.showFloat( args.message, function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});

		Homey.manager('flow').on('action.poweroff', function( callback, args ){

      self.retrieveTV( args.tv.id, function ( err, tv ) {
        if ( err ) return callback(err);

        tv.turnOff( function(err, result){
          if( err ) return callback(err);
          return callback( null, result.returnValue );
        });
      });
		});
	},

  retrieveTV : function ( id, callback ){
    var tv = self.tvs[id];
    var deviceObj = self.devices[id];

    if ( typeof tv != 'undefined' ) {
      return callback( null, tv );
    }

    if ( typeof deviceObj == 'undefined' ) {
      return callback( "TV not connected" );
    }

    if ( deviceObj ) {
      self.connectToDevice( deviceObj, function ( err, tv ){
        if ( err ) return callback( "TV not connected" );

        return callback( null, tv );
      })
    }
  },

  connectToDevice: function( device, callback ) {
    callback = callback || function(){}

    var tv = new webos.Remote({
      reconnectFromStart	: true,
      address		  : device.ip,
      key					: device.key,
      debug				: false
    })

    var timeId = setTimeout(function () {
      return callback ( 'Timeout', null );
    }, 2000);

    tv.connect({}, function( err, result ){

      clearTimeout(timeId);

      if( err ) return callback( err );

      tv.on('disconnect', function(){
        self.tvs[ device.id ] = undefined;
        Homey.log("TV Disconnected");
      })

      tv.on('reconnect', function(){
        self.tvs[ device.id ] = tv;
        Homey.log("TV Reconnected");
      })

      Homey.log('TV (connected) ');
      self.tvs[ device.id ] = tv;
      callback( null, tv );
    });
  }
}

