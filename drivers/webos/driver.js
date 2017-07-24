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
			.registerRunListener( ( args, state ) => {
				
				return args.tv
					.getWebOSDeviceAsync()
					.then( device => {
						return device.setChannel( args.channel.id );
					});
				
			})
			.getArgument('channel')
			.registerAutocompleteListener( ( query, args ) => {
				
				return args.tv
					.getWebOSDeviceAsync()
					.then( device => {
				
						return device.getChannels()
							.then( channels => {
								return channels.map( channel => {
									return {
										name: channel.number + '. ' + channel.name,
										id: channel.id
									}
								}).filter( channel => {
									return channel.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
								})
							})
					});
			});
		
		new Homey.FlowCardAction('set_input')
			.register()
			.registerRunListener( ( args, state ) => {
				
				return args.tv
					.getWebOSDeviceAsync()
					.then( device => {
						return device.setInput( args.input.id );
					});
					
			})
			.getArgument('input')
			.registerAutocompleteListener( ( query, args ) => {
				
				return args.tv
					.getWebOSDeviceAsync()
					.then( device => {
						return device.getInputs()
							.then( inputs => {
								return inputs.map( input => {
									return {
										name: input.label,
										image: input.icon,
										id: input.id
									}
								}).filter( input => {
									return input.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
								})
							});
					});
						
			});
		
		new Homey.FlowCardAction('show_float')
			.register()
			.registerRunListener( ( args, state ) => {
				
				return args.tv
					.getWebOSDeviceAsync()
					.then( device => {
						return device.createToast( args.message );						
					})
				
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