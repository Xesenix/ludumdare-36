'use strict';
var ControllableGameObject = require('./controllable_game_object.js');
var index = 0;
function Arrow(game, x, y) {
	ControllableGameObject.call(this, game, 1, 1, 0, 'arrow', 'arrow-dead');
	this.x = x;
	this.y = y;
	this.range = 1024;
	
	this.blocksOnDeath = false;
	this.canDie = true;
	this.controllable = false;
	
	this.collisionDmg = 1;
	
	this.body.setSize(32, 32, 16, 16);
	
	this.index = 'arrow_' + index ++;
}

Arrow.prototype = Object.create(ControllableGameObject.prototype);
Arrow.prototype.constructor = Arrow;

module.exports = Arrow;