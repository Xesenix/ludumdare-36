'use strict';
/* global Phaser */
var MuteButton = require('../components/mute_button.js');

function Intro() {}

Intro.prototype = {
	preload: function() {
		console.log('preload intro');
	},
	create: function() {
		this.sprite = this.game.add.sprite(this.game.world.centerX, 180, 'ludumdare-logo');
		this.sprite.anchor.setTo(0.5, 0.5);

		this.titleLabel = this.game.add.text(this.game.world.centerX, 320, 'Ancient Maze of Epla\nLudumdare 36', { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.titleLabel.anchor.setTo(0.5, 0.5);

		this.authorLabel = this.game.add.text(this.game.world.centerX, 420, 'Game by Xesenix', { font: '36px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.authorLabel.anchor.setTo(0.5, 0.5);

		this.instructionsLabel = this.game.add.text(this.game.world.centerX, 460, 'Click anywhere to play', { font: '24px ' + this.game.theme.font, fill: '#dddddd', align: 'center'});
		this.instructionsLabel.anchor.setTo(0.5, 0.5);

		this.game.add.tween(this.sprite).from({ y: -120 }, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		this.game.add.tween(this.titleLabel).from({ y: this.game.world.height + 80}, 500, Phaser.Easing.Linear.NONE, true, 500, 0, false);
		this.game.add.tween(this.authorLabel).from({ alpha: 0 }, 500, Phaser.Easing.Linear.NONE, true, 1000, 0, false);
		this.game.add.tween(this.instructionsLabel).from({ alpha: 0 }, 500, Phaser.Easing.Linear.NONE, true, 1500, 0, false);
		
		//button.fixedToCamera = true;
		
		if (typeof this.game.music === 'undefined') {
			this.game.music = this.game.add.audio('melody');

			this.game.music.loopFull();
			
			MuteButton.loadState(this.game);
		}
	},
	update: function() {
		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('menu');
		}
	}
};

module.exports = Intro;