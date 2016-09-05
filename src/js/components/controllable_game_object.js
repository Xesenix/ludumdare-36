'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');
var GameObject = require('./game_object.js');

function ControllableGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	GameObject.call(this, game,  hp, dmg, def, aliveSprite, deadSprite);
	
	// describes what Game Object should be doing in current turn transition
	this.currentAction = { x: 0, y: 0 };
	
	// describes how fast shouldGame Object move in turn transition
	this.speed = 1024;
	// if moves pass this value durring turn transition it should stop and return finish event
	this.range = 64;
	// tells if user commands should controll that GameObject
	this.controllable = true;
	
	// callback that should be called after finished turn transition
	this.commandDeffer = null;
	
	this.afterDeath = new Phaser.Signal();
}

ControllableGameObject.prototype = Object.create(GameObject.prototype);
ControllableGameObject.prototype.constructor = ControllableGameObject;

ControllableGameObject.prototype.getAction = function(command) {
	var action = { x: 0, y: 0, stopDistance: this.range };
	switch (command) {
		case 'right':
			action.x = this.speed;
			break;
		case 'left':
			action.x = -this.speed;
			break;
		case 'up':
			action.y = -this.speed;
			break;
		case 'down':
			action.y = this.speed;
			break;
	}
	
	return action;
};

ControllableGameObject.prototype.executeCommand = function(command) {
	// regenerate helth on turn start
	this._hp = this._hpMax;
	
	var action = this.getAction(command);
	
	return new Promise(_.bind(function(resolve) {
		this.currentAction = action;
		
		this.startPosition = _.clone(this.body.position);
		// snap to clossest grid
		this.startPosition.x = Math.round(this.startPosition.x / 64) * 64;
		this.startPosition.y = Math.round(this.startPosition.y / 64) * 64;
		
		this.body.immovable = false;
		this.body.velocity.x = action.x;
		this.body.velocity.y = action.y;
		this.commandDeffer = resolve;
	}, this));
};

ControllableGameObject.prototype.update = function() {
	if (this._hp <= 0 && this.alive) {
		// important do not check for death in collisions as that may turn off triggering of some events
		// do it instead in update loop
		this.onDeath();
	} else if (this.commandDeffer !== null) {
		// if in turn transition state check if end of transition was reached
		var distance = this.body.position.distance(this.startPosition);
		
		if (distance >= this.currentAction.stopDistance || (Math.abs(this.body.velocity.x) <= 0.1 && Math.abs(this.body.velocity.y) <= 0.1)) {
			this.stop();
		}
	}
};

ControllableGameObject.prototype.onDeath = function() {
	// change GameObject texture
	this.loadTexture(this.deadSprite);
	// set inactive if it can be killed
	this.alive = !this.canDie;
	// stop moving
	this.stop();
	// and return info about finished transition
	this.afterDeath.dispatch();
};

ControllableGameObject.prototype.stop = function() {
	// console.log('stop', this.index);
	if (this.commandDeffer !== null) {
		this.commandDeffer(this.currentAction);
		this.commandDeffer = null;
	}
	this.body.immovable = true;
	this.body.velocity.x = 0;
	this.body.velocity.y = 0;
};

module.exports = ControllableGameObject;