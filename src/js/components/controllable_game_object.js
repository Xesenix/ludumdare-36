'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');
var GameObject = require('./game_object.js');

function ControllableGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	GameObject.call(this, game,  hp, dmg, def, aliveSprite, deadSprite);
	
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	this.currentAction = { x: 0, y: 0 };
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	this.collisionDmg = 0;
	this.speed = 1024;
	this.range = 64;
	
	this.controllable = true;
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
	this._hp = this._hpMax;
	
	var action = this.getAction(command);
	
	//action.x = Math.max(Math.min(action.x, 800 - 32), 32);
	//action.y = Math.max(Math.min(action.y, 600 - 32), 32);
	
	//var distance = Math.max(Math.abs(this.x - action.x), Math.abs(this.y - action.y)) / 64;
	
	return new Promise(_.bind(function(resolve) {
		//this.tween = this.game.add.tween(this).to(action, 200 * distance, Phaser.Easing.Linear.NONE, true, 0, 0, false);
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
		this.onDeath();
	} else if (this.commandDeffer !== null) {
		var distance = this.body.position.distance(this.startPosition);
		
		if (distance >= this.currentAction.stopDistance || (Math.abs(this.body.velocity.x) <= 0.1 && Math.abs(this.body.velocity.y) <= 0.1)) {
			this.stop();
		}
	}
};

ControllableGameObject.prototype.onDeath = function() {
	// console.log('dead', this.index);
	this.loadTexture(this.deadSprite);
	this.alive = !this.canDie;
	this.stop();
	
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