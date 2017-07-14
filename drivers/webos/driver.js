'use strict';

const webos = require('webos');
const Homey = require('homey');

class LGWebOSDriver extends Homey.Driver {
	
	onInit() {
		
		this._discovery = new webos.WebOSDiscovery();
		this._discovery.start();
		this._discovery.on('device', device => {
			this.log('Device found:', device.getOpt('friendlyName'), '@', device.getOpt('address'));
			this.emit('_device', device);
		});
		
		this._initFlow();
		this._initSignal();
		
	}
	
	_initSignal() {
		let signal = new Homey.SignalInfrared('lg');
		signal.register()
			.then( result => {
				this._signal = signal;
				this.log('Signal registered');
			})
			.catch( err => {
				this.error('Could not register infrared signal:', err.message);
			})
	}
	
	_initFlow() {
		
		new Homey.FlowCardAction('set_channel')
			.register()
			.on('run', ( args, state, callback ) => {
				
				let device = args.tv.getWebOSDevice();
				if( device instanceof Error ) return callback( device );
				
				device.setChannel( args.channel.id )
					.then( res => {
						callback( null, true );
					})
					.catch( callback );
			})
			.getArgument('channel')
			.on('autocomplete', ( query, args, callback ) => {
				
				let device = args.tv.getWebOSDevice();
				if( device instanceof Error ) return callback( device );
				
				device.getChannels()
					.then( channels => {
						channels = channels.map( channel => {
							return {
								name: channel.number + '. ' + channel.name,
								id: channel.id
							}
						}).filter( channel => {
							return channel.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
						})
												
						callback( null, channels );
					})
					.catch( callback );
			});
		
		new Homey.FlowCardAction('set_input')
			.register()
			.on('run', ( args, state, callback ) => {
				
				let device = args.tv.getWebOSDevice();
				if( device instanceof Error ) return callback( device );
				
				device.setInput( args.input.id )
					.then( res => {
						callback( null, true );
					})
					.catch( callback );
			})
			.getArgument('input')
			.on('autocomplete', ( query, args, callback ) => {
				
				let device = args.tv.getWebOSDevice();
				if( device instanceof Error ) return callback( device );
				
				device.getInputs()
					.then( inputs => {
												
						inputs = inputs.map( input => {
							return {
								name: input.label,
								image: input.icon,
								id: input.id
							}
						}).filter( input => {
							return input.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
						})
												
						callback( null, inputs );
					})
					.catch( callback );
			});
		
		new Homey.FlowCardAction('show_float')
			.register()
			.on('run', ( args, state, callback ) => {
				
				let device = args.tv.getWebOSDevice();
				if( device instanceof Error ) return callback( device );
				
				device.createToast( args.message )
					.then( res => {
						callback( null, true );
					})
					.catch( callback );
				
			});
		
	}
	
	getWebOSDevice( id ) {
		return new Promise(( resolve, reject ) => {
			
			let device = this._discovery.getDevice( id );
			if( device instanceof webos.WebOSDevice ) return resolve( device );
			if( device instanceof Error ) return this.on('_device', device => {
				if( device.getOpt('id') === id ) return resolve( device );
			});
			
		});
	}
	
	getWebOSSignal() {
		return this._signal || new Error('invalid_signal');
	}
	
	onPair( socket ) {
		
		socket.on('list_devices', ( data, callback ) => {
			
			let devicesArr = [];
			let devicesObj = this._discovery.getDevices();
			
			for( let id in devicesObj ) {
				let device = devicesObj[id];
				
				devicesArr.push({
					data: {
						id: device.getOpt('id')
					},
					name: device.getOpt('friendlyName')
				})
			}
			
			callback( null, devicesArr );
			
		});
		
		socket.on('handshake', ( deviceId, callback ) => {
			
			let device = this._discovery.getDevice( deviceId );
			if( device instanceof Error ) return callback( device );
			
			device.once('key', key => {
				this.log('Got key:', key);
				callback( null, key );				
			})
			
			device
				.createToast( Homey.__('pair_success') )
				.catch( err => {
					this.error( err );
					callback( err );
				});
			
		});
		
	}
	
}

module.exports = LGWebOSDriver;