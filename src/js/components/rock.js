'use strict';
var ControllableGameObject = require('./controllable_game_object.js');

function Rock(game, x, y) {
	ControllableGameObject.call(this, game, 2, 2, 1, 'rock', 'rock-dead');
	this.x = x;
	this.y = y;
	this.range = 1024;
	
	this.canDie = true;
}

Rock.prototype = Object.create(ControllableGameObject.prototype);
Rock.prototype.constructor = Rock;

module.exports = Rock;