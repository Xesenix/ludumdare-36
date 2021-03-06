'use strict';
/* global Phaser */

function Preload() {
	this.asset = null;
	this.ready = false;
}

Preload.prototype = {
	preload: function() {
		console.log('preload assets');
		this.asset = this.add.sprite(this.world.width / 2, this.world.height / 2, 'preloader');
		this.asset.anchor.setTo(0.5, 0.5);

		this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
		this.load.setPreloadSprite(this.asset);
		this.load.image('ludumdare-logo', 'assets/phaser-logo.png');
		this.load.image('hero', 'assets/hero.png');
		this.load.image('hero-dead', 'assets/hero-dead.png');
		this.load.image('rock', 'assets/rock.png');
		this.load.image('rock-dead', 'assets/rock-dead.png');
		this.load.image('block', 'assets/block.png');
		this.load.image('bow', 'assets/bow.png');
		this.load.image('arrow', 'assets/arrow.png');
		this.load.image('techcard', 'assets/techcard.png');
		this.load.image('arrow-dead', 'assets/broken-arrow.png');
		this.load.image('lock', 'assets/lock.png');
		this.load.image('restart', 'assets/restart.png');
		this.load.image('close', 'assets/close.png');
		
		this.load.tilemap('menu', 'assets/menu.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('tutorial', 'assets/tutorial.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-1', 'assets/level01.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-2', 'assets/level02.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-3', 'assets/level03.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-4', 'assets/level04.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-5', 'assets/level05.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('level-6', 'assets/level06.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.image('tiles', 'assets/tiles.png');
		
		this.load.audio('melody', 'assets/melody01.wav');
		
		this.load.image('btn', 'assets/btn.png');
		this.load.spritesheet('mute', 'assets/mute.png', 64, 64);

	},
	create: function() {
		this.asset.cropEnabled = false;
		
		this.infoLabel = this.game.add.text(
			this.game.world.centerX, 
			this.game.world.centerY - 30, 
			'Loading assets...', 
			{ font: '18px ' + this.game.theme.font, fill: '#ffffff', align: 'center'}
		);
		this.infoLabel.anchor.setTo(0.5, 0.5);
	},
	onLoadComplete: function() {
		this.game.state.start('intro');
	}
};

module.exports = Preload;
