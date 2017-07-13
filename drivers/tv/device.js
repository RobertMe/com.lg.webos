'use strict';

const Homey = require('homey');

class LGWebOSDevice extends Homey.Device {
	
	onInit() {
		
		this.log('onInit', this.getName())
		
		this.setUnavailable();
		
		this._driver = this.getDriver();
		this._driver.getWebOSDevice( this.getData().id )
			.then( device => {
				this._device = device;
				this.setAvailable();	
				this.log('Got my instance!');			
			})
		
	}
	
}

module.exports = LGWebOSDevice;