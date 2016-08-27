'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');
function Hero(game, x, y, key, frame) {
	Phaser.Sprite.call(this, game, x, y, key, frame);
	this.anchor.setTo(0.5, 0.5);
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	
	this.hp = 10;
	this.dmg = 0;
	this.def = 0;
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.executeCommand = function(command) {
	var action = { x: this.x, y: this.y };
	switch (command) {
		case 'right':
			action.x += 64;
			break;
		case 'left':
			action.x -= 64;
			break;
		case 'up':
			action.y -= 64;
			break;
		case 'down':
			action.y += 64;
			break;
	}
	action.x = Math.max(Math.min(action.x, 800 - 32), 32);
	action.y = Math.max(Math.min(action.y, 800 - 32), 32);
	
	return new Promise(_.bind(function(resolve) {
		console.log('hero command start', command, action);
		this.tween = this.game.add.tween(this).to(action, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		this.tween.onComplete.add(resolve);
	}, this));
};

Hero.prototype.onDeath = function() {
	console.log('Dead', this);
	this.loadTexture('hero-dead');
	this.alive = false;
	this.tween.onComplete.boundDispatch();
	this.game.tweens.remove(this.tween);
};
Hero.prototype.onCollision = function(other) {
	console.log('Walk into', other);
};


function Rock(game, x, y, key, frame) {
	Phaser.Sprite.call(this, game, x, y, key, frame);
	this.anchor.setTo(0.5, 0.5);
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	
	this.hp = 10;
	this.dmg = 20;
	this.def = 1;
}

Rock.prototype = Object.create(Phaser.Sprite.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.executeCommand = function(command) {
	var action = { x: this.x, y: this.y, angle: 360 };
	switch (command) {
		case 'right':
			action.x += 256;
			break;
		case 'left':
			action.x -= 256;
			action.angle = -360;
			break;
		case 'up':
			action.y -= 256;
			action.angle = -360;
			break;
		case 'down':
			action.y += 256;
			break;
	}
	
	action.x = Math.max(Math.min(action.x, 800 - 32), 32);
	action.y = Math.max(Math.min(action.y, 800 - 32), 32);
	
	return new Promise(_.bind(function(resolve) {
		console.log('rock command start', command, action);
		this.tween = this.game.add.tween(this).to(action, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		this.tween.onComplete.add(resolve);
	}, this));
};

Rock.prototype.onDeath = function() {
	console.log('Dead', this);
	this.loadTexture('rock-dead');
	this.alive = false;
	this.game.tweens.remove(this.tween);
};
Rock.prototype.onCollision = function(other) {
	console.log('Hit', other);
};

function Play() {}

Play.prototype = {
	init: function() {
		
		this.reset();
	},
	reset: function() {
		this.executing = 0;
		this.commandQueueIndex = 0;
		this.commandQueue = [];
	},
	create: function() {
		this.commandableGroup = this.game.add.physicsGroup(Phaser.Physics.ARCADE);
		this.hero = new Hero(this.game, 128, 128, 'hero');
		
		this.commandableGroup.add(this.hero);
		
		this.rock1 = new Rock(this.game, 128, 32, 'rock');
		
		this.commandableGroup.add(this.rock1);
		
		this.rock2 = new Rock(this.game, 32, 128, 'rock');
		
		this.commandableGroup.add(this.rock2);

		this.commandableGroup.setAll('body.collideWorldBounds', true);
		this.commandableGroup.setAll('body.bounce.x', 1);
		this.commandableGroup.setAll('body.bounce.y', 1);
		
		this.setupKeyboard();
	},
	setupKeyboard: function() {
		//this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		//this.resetKey.onDown.add(_.bind(this.reset, this));
		
		this.game.input.keyboard.onDownCallback = _.bind(this.onKeyboardDown, this);
		this.game.input.keyboard.onUpCallback = _.bind(this.onKeyboardUp, this);
	},
	onKeyboardDown: function () {
		var keyboard = this.game.input.keyboard;
		
		if (keyboard.isDown(Phaser.Keyboard.LEFT) || keyboard.isDown(Phaser.Keyboard.A)) {
			this.addCommand('left');
		} else if (keyboard.isDown(Phaser.Keyboard.RIGHT) || keyboard.isDown(Phaser.Keyboard.D)) {
			this.addCommand('right');
		} else if (keyboard.isDown(Phaser.Keyboard.UP) || keyboard.isDown(Phaser.Keyboard.W)) {
			this.addCommand('up');
		} else if (keyboard.isDown(Phaser.Keyboard.DOWN) || keyboard.isDown(Phaser.Keyboard.S)) {
			this.addCommand('down');
		}
		
		console.log('executing ', this.executing, this.commandQueueIndex, this.commandQueue);
	},
	onKeyboardUp: function () {
	},
	update: function() {
		if (this.executing === 0 && this.commandQueue.length > this.commandQueueIndex) {
			this.commandableGroup.forEachAlive(this.startObjectCommand, this);
			this.commandQueueIndex ++;
		}
		
		this.commandableGroup.forEachAlive(_.bind(function TestCollisions(obj) {
			this.commandableGroup.forEachAlive(_.bind(function TestOther(obj, other) {
				if (obj !== other && Phaser.Rectangle.intersects(obj.getBounds(), other.getBounds())) {
					obj.onCollision(other);
					other.onCollision(obj);
					this.onCollision(obj, other);
				}
			}, this, _, obj));
		}, this));
	},
	onCollision: function(objA, objB) {
		objA.hp -= Math.max(objB.dmg - objB.def, 0);
		objB.hp -= Math.max(objA.dmg - objA.def, 0);
		
		if (objA.hp <= 0) {
			objA.onDeath();
		}
		
		if (objB.hp <= 0) {
			objB.onDeath();
		}
	},
	addCommand: function(command) {
		console.log('new command ', command);
		this.commandQueue.push(command);
		this.enabled = false;
		
	},
	startObjectCommand: function(object) {
		this.executing ++;
		object.executeCommand(this.commandQueue[this.commandQueueIndex]).then(_.bind(this.onObjectCommandFinish, this));
	},
	onObjectCommandFinish: function() {
		this.executing --;
		console.log('command executed', this.executing);
	},
	clickListener: function() {
		this.game.state.start('gameover');
	}
};

module.exports = Play;