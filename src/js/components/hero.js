'use strict';
var ControllableGameObject = require('./controllable_game_object.js');
var index = 0;

function Hero(game, x, y) {
	ControllableGameObject.call(this, game, 1, 0, 0, 'hero', 'hero-dead');
	this.x = x;
	this.y = y;
	
	// tells if Game Object is and obstacle after death
	this.blocksOnDeath = false;
	
	// tells if when hp goes to or below 0 Game Object should set it self as inactive
	this.canDie = true;
	
	// flag checked in collsions with collectable Game objects
	this.canCollect = true;
	
	// insted of using standard arcade collisions we are using mask 
	// for example so that player could move on stairs and othere object not
	// this specific value tell that hero can colide only with wall tiles
	this.collisionMask = 1;
	
	this.index = 'hero_' + index ++;
}

Hero.prototype = Object.create(ControllableGameObject.prototype);
Hero.prototype.constructor = Hero;

module.exports = Hero;