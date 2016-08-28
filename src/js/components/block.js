'use strict';
var ControllableGameObject = require('./controllable_game_object.js');

function Block(game, x, y) {
	ControllableGameObject.call(this, game, 1, 0, 2, 'block', 'block');
	this.x = x;
	this.y = y;
}

Block.prototype = Object.create(ControllableGameObject.prototype);
Block.prototype.constructor = Block;

module.exports = Block;