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
		this.load.image('hero', 'assets/hero.png');
		this.load.image('hero-dead', 'assets/hero-dead.png');
		this.load.image('rock', 'assets/rock.png');
		this.load.image('rock-dead', 'assets/rock-dead.png');

	},
	create: function() {
		this.asset.cropEnabled = false;
	},
	update: function() {
		if (!!this.ready) {
			this.game.state.start('play');
		}
	},
	onLoadComplete: function() {
		this.ready = true;
	}
};

module.exports = Preload;
