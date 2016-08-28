'use strict';
var ControllableGameObject = require('./controllable_game_object.js');

function Hero(game, x, y) {
	ControllableGameObject.call(this, game, 1, 0, 0, 'hero', 'hero-dead');
	this.x = x;
	this.y = y;
	
	this.blocksOnDeath = false;
	this.canDie = true;
	this.canCollect = true;
	
	this.collisionMask = 1;// walls
}

Hero.prototype = Object.create(ControllableGameObject.prototype);
Hero.prototype.constructor = Hero;

module.exports = Hero;