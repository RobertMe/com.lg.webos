'use strict';

const webos = require('webos');
const Homey = require('homey');

class LGWebOSDriver extends Homey.Driver {
	
	onInit() {
		
		this._discovery = new webos.WebOSDiscovery();
		this._discovery.start();
		this._discovery.on('device', device => {
			this.log('Device found:', device.getOpt('name'), '@', device.getOpt('address'));
			this.emit('_device', device);
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
					name: device.getOpt('name')
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