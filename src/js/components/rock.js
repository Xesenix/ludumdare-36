'use strict';
var ControllableGameObject = require('./controllable_game_object.js');
var index = 0;

// Game object that move as far as he can go and kill anything in its way
function Rock(game, x, y) {
	ControllableGameObject.call(this, game, 2, 3, 1, 'rock', 'rock-dead');
	this.x = x;
	this.y = y;
	
	// if moves pass this value durring turn transition it should stop and return finish event
	this.range = 1024;
	
	// tells if when hp goes to or below 0 Game Object should set it self as inactive
	this.canDie = true;
	
	this.index = 'rock_' + index ++;
}

Rock.prototype = Object.create(ControllableGameObject.prototype);
Rock.prototype.constructor = Rock;

module.exports = Rock;