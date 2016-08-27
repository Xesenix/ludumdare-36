'use strict';
/* global Phaser */

function Menu() {}

Menu.prototype = {
	preload: function() {

	},
	create: function() {
		this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'ludumdare-logo');
		this.sprite.anchor.setTo(0.5, 0.5);

		this.sprite.angle = -20;
		this.game.add.tween(this.sprite).to({angle: 20}, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);
	},
	update: function() {
		if (this.game.input.activePointer.justPressed()) {
			this.game.state.start('play');
		}
	}
};

module.exports = Menu;
