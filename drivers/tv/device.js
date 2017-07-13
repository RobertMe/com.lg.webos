'use strict';

const Homey = require('homey');

class LGWebOSDevice extends Homey.Device {
	
	onInit() {
		
		this.log('onInit', this.getName())
				
		this.setCapabilityValue('onoff', false);
					
		this._driver = this.getDriver();
		this._driver.getWebOSDevice( this.getData().id )
			.then( device => {
				this._device = device;
				//this._device.setOpt( 'debug', true );
				this._device.setOpt( 'key', this.getStoreValue('key') );
				
				this.log('Available');
				
				this.setCapabilityValue('onoff', true);
				
				// get initial volume
				this._device.getVolume()
					.then( result => {
						if( result.volume > -1 ) {
							this.setCapabilityValue('volume_set', result.volume / 100 );
						}
						this.setCapabilityValue('volume_mute', result.muted );
					})
			})
		
		this.registerCapabilityListener('onoff', this._onCapabilityOnoff.bind(this))
		this.registerCapabilityListener('volume_set', this._onCapabilityVolumeSet.bind(this))
		this.registerCapabilityListener('volume_mute', this._onCapabilityVolumeMute.bind(this))
		
	}
	
	_onCapabilityOnoff( value, opts ) {
		this.log('_onCapabilityOnoff', value);
		return Promise.resolve();
	}
	
	_onCapabilityVolumeSet( value, opts ) {
		this.log('_onCapabilityVolumeSet', value);
		return this._device.setVolume( value * 100 );
	}
	
	_onCapabilityVolumeMute( value, opts ) {
		this.log('_onCapabilityVolumeMute', value);
		return this._device.setMute( value );
	}
	
}

module.exports = LGWebOSDevice;