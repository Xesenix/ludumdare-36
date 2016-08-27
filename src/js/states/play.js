'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');

function StaticGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	Phaser.Sprite.call(this, game, 0, 0, aliveSprite);
	
	this.anchor.setTo(0.5, 0.5);
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	this.tween = null;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	
	this.canDie = false;
	this.controllable = false;
}

StaticGameObject.prototype = Object.create(Phaser.Sprite.prototype);
StaticGameObject.prototype.constructor = StaticGameObject;

StaticGameObject.prototype.onDeath = function() {
	console.log('Dead', this);
	this.loadTexture(this.deadSprite);
	this.alive = !this.canDie;
	this.controllable = false;
	if (this.tween !== null) {
		this.tween.onComplete.boundDispatch();
		this.game.tweens.remove(this.tween);
	}
};
StaticGameObject.prototype.onCollision = function(other) {
	console.log('Move into', other);
};

function Wall(game, x, y) {
	StaticGameObject.call(this, game, 0, 0, 0, 'block', 'block');
	this.x = x;
	this.y = y;
	this.tint = 0x888888;
}

Wall.prototype = Object.create(StaticGameObject.prototype);
Wall.prototype.constructor = Wall;

Wall.prototype.onCollision = function(other) {
	console.log('Hmm', other);
	if (typeof other.stop !== 'undefined') {
		other.stop(this);
	}
};

function ActiveGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	StaticGameObject.call(this, game,  hp, dmg, def, aliveSprite, deadSprite);
	
	this.anchor.setTo(0.5, 0.5);
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	
	this.controllable = true;
}

ActiveGameObject.prototype = Object.create(StaticGameObject.prototype);
ActiveGameObject.prototype.constructor = ActiveGameObject;

ActiveGameObject.prototype.getAction = function(command) {
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
	
	return action;
};

ActiveGameObject.prototype.executeCommand = function(command) {
	var action = this.getAction(command);
	
	action.x = Math.max(Math.min(action.x, 800 - 32), 32);
	action.y = Math.max(Math.min(action.y, 600 - 32), 32);
	
	var distance = Math.max(Math.abs(this.x - action.x), Math.abs(this.y - action.y)) / 64;
	
	return new Promise(_.bind(function(resolve) {
		console.log('command start', command, action);
		this.tween = this.game.add.tween(this).to(action, 200 * distance, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		this.tween.onComplete.add(resolve);
	}, this));
};

ActiveGameObject.prototype.stop = function() {
	if (this.tween !== null) {
		this.tween.onComplete.boundDispatch();
		this.game.tweens.remove(this.tween);
	}
};

function Hero(game, x, y) {
	ActiveGameObject.call(this, game, 10, 0, 0, 'hero', 'hero-dead');
	this.x = x;
	this.y = y;
	
	this.canDie = true;
}

Hero.prototype = Object.create(ActiveGameObject.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.onCollision = function(other) {
	console.log('Walk into', other);
};

function Rock(game, x, y) {
	ActiveGameObject.call(this, game, 10, 20, 1, 'rock', 'rock-dead');
	this.x = x;
	this.y = y;
}

Rock.prototype = Object.create(ActiveGameObject.prototype);
Rock.prototype.constructor = Rock;

Rock.prototype.getAction = function(command) {
	var action = { x: this.x, y: this.y };
	switch (command) {
		case 'right':
			action.x += 512;
			break;
		case 'left':
			action.x -= 512;
			break;
		case 'up':
			action.y -= 512;
			break;
		case 'down':
			action.y += 512;
			break;
	}
	
	return action;
};

Rock.prototype.onCollision = function(other) {
	console.log('Hit', other);
};

function Block(game, x, y) {
	ActiveGameObject.call(this, game, 10, 0, 1, 'block', 'block');
	this.x = x;
	this.y = y;
}

Block.prototype = Object.create(ActiveGameObject.prototype);
Block.prototype.constructor = Block;

Block.prototype.getAction = function(command) {
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
	
	return action;
};

Block.prototype.onCollision = function(other) {
	console.log('Hmm', other);
	if (typeof other.stop !== 'undefined') {
		other.stop(this);
	}
};

var Geometry = {
	intersects: function (a, b) {
		if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0)
		{
			return false;
		}

		return !(a.right <= b.x || a.bottom <= b.y || a.x >= b.right || a.y >= b.bottom);
	}
};

var tileSize = 64;

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
		
		this.staticGroup = this.game.add.group();
		
		for (var x = 0; x < 10; x++) {
			var wall = new Wall(this.game, x * tileSize, tileSize);
			this.staticGroup.add(wall);
		}
		
		this.commandableGroup = this.game.add.group();
		this.hero = new Hero(this.game, 2 * tileSize, 3 * tileSize);
		
		this.commandableGroup.add(this.hero);
		
		this.rock1 = new Rock(this.game, 2 * tileSize, 2 * tileSize);
		
		this.commandableGroup.add(this.rock1);
		
		this.rock2 = new Rock(this.game, tileSize, 3 * tileSize);
		
		this.commandableGroup.add(this.rock2);
		
		this.block = new Block(this.game, 3 * tileSize, 3 * tileSize);
		
		this.commandableGroup.add(this.block);
		
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
				if (obj !== other && Geometry.intersects(obj.getBounds(), other.getBounds())) {
					obj.onCollision(other);
					other.onCollision(obj);
					this.onCollision(obj, other);
				}
			}, this, _, obj));
		}, this));
		
		this.staticGroup.forEach(_.bind(function TestCollisions(obj) {
			this.commandableGroup.forEachAlive(_.bind(function TestOther(obj, other) {
				if (obj !== other && Geometry.intersects(obj.getBounds(), other.getBounds())) {
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
		if (object.controllable) {
			this.executing ++;
			object.executeCommand(this.commandQueue[this.commandQueueIndex]).then(_.bind(this.onObjectCommandFinish, this, object));
		}
	},
	onObjectCommandFinish: function(object) {
		this.executing --;
		
		object.x = Math.floor((object.x + 32) / 64) * 64;
		object.y = Math.floor((object.y + 32) / 64) * 64;
		console.log('command executed', this.executing);
	},
	clickListener: function() {
		this.game.state.start('gameover');
	}
};

module.exports = Play;