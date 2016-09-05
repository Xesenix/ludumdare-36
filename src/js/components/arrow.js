'use strict';
var ControllableGameObject = require('./controllable_game_object.js');
var index = 0;
function Arrow(game, x, y) {
	ControllableGameObject.call(this, game, 1, 1, 0, 'arrow', 'arrow-dead');
	this.x = x;
	this.y = y;
	this.range = 1024;
	
	// tells if Game Object is and obstacle after death
	this.blocksOnDeath = false;
	
	// tells if when hp goes to or below 0 Game Object should set it self as inactive
	this.canDie = true;
	
	// tells if user commands should controll that GameObject
	this.controllable = false;
	
	// how much damage will Game Object suffer from hitting something else
	this.collisionDamage = 1;
	
	this.body.setSize(32, 32, 16, 16);
	
	this.index = 'arrow_' + index ++;
}

Arrow.prototype = Object.create(ControllableGameObject.prototype);
Arrow.prototype.constructor = Arrow;

module.exports = Arrow;