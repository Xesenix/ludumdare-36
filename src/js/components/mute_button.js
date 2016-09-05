'use strict';
/* global Phaser */
var _ = require('lodash');

var MuteButton = function(game, x, y, key) {
	Phaser.Button.call(this, game, x, y, key, _.bind(this.toggleMusic, this));
	this.updateState();
};

MuteButton.prototype = Object.create(Phaser.Button.prototype);
MuteButton.prototype.constructor = MuteButton;

MuteButton.prototype.toggleMusic = function() {
	this.game.sound.mute = !this.game.sound.mute;
	this.updateState();
	
	this.game.dataStorage.setUserData('mute', this.game.sound.mute);
};

MuteButton.prototype.updateState = function() {
	if (this.game.sound.mute) {
		this.setFrames(0, 1, 0, 1);
	} else {
		this.setFrames(1, 0, 1, 0);
	}
};

MuteButton.loadState = function(game) {
	game.sound.mute = false;
	game.dataStorage.getUserData('mute').then(function(muted) {
		game.sound.mute = muted;
	});
};

module.exports = MuteButton;