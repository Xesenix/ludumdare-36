'use strict';

function Preload() {
	this.asset = null;
	this.ready = false;
}

Preload.prototype = {
	preload: function() {
		this.asset = this.add.sprite(this.world.width / 2, this.world.height / 2, 'preloader');
		this.asset.anchor.setTo(0.5, 0.5);

		this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.setPreloadSprite(this.asset);
		this.load.image('ludumdare-logo', 'assets/phaser-logo.png');

	},
	create: function() {
		this.asset.cropEnabled = false;
	},
	update: function() {
		if (!!this.ready) {
			this.game.state.start('intro');
		}
	},
	onLoadComplete: function() {
		this.ready = true;
	}
};

module.exports = Preload;
