'use strict';
/* global Phaser */

var LabelButton = function(game, x, y, key, text, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
	Phaser.Button.call(this, game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame); 
	this.label = new Phaser.Text(game, 0, 0, text, { align: 'center', boundsAlignH: 'center', boundsAlignV: 'middle' });
	this.label.anchor.setTo(0.5, 0.5);
	this.addChild(this.label);
};

LabelButton.prototype = Object.create(Phaser.Button.prototype);
LabelButton.prototype.constructor = LabelButton;

Object.defineProperty(LabelButton.prototype, 'height', {

	get: function() {
		return this.scale.x * this.texture.frame.height;
	},

	set: function(value) {
		this.scale.y = value / this.texture.frame.height;
		this._height = value;
		this.label.scale.y = this.texture.frame.height / value;
		this.label.y = this.label.scale.y * value * (0.5 - this.anchor.y);
	}

});

Object.defineProperty(LabelButton.prototype, 'width', {

	get: function() {
		return this.scale.x * this.texture.frame.width;
	},

	set: function(value) {
		this.scale.x = value / this.texture.frame.width;
		this._width = value;
		this.label.scale.x = this.texture.frame.width / value;
		this.label.x = this.label.scale.x * value * (0.5 - this.anchor.x);
	}

});

module.exports = LabelButton;