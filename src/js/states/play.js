'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');

function StaticGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	Phaser.Sprite.call(this, game, 0, 0, aliveSprite);
	
	this.anchor.setTo(0.5, 0.5);
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	
	this.canDie = false;
	this.controllable = false;
}

StaticGameObject.prototype = Object.create(Phaser.Sprite.prototype);
StaticGameObject.prototype.constructor = StaticGameObject;

function Wall(game, x, y) {
	StaticGameObject.call(this, game, 0, 0, 0, 'block', 'block');
	this.x = x;
	this.y = y;
	this.tint = 0x888888;
}

Wall.prototype = Object.create(StaticGameObject.prototype);
Wall.prototype.constructor = Wall;

function ActiveGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	StaticGameObject.call(this, game,  hp, dmg, def, aliveSprite, deadSprite);
	
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	this.speed = 512;
	this.range = 64;
	
	this.controllable = true;
	this.commandDeffer = null;
	
	this.physicsType = Phaser.SPRITE;
	
	game.physics.enable(this);
	
	this.body.collideWorldBounds = true;
	this.body.bounce.set(0);
	this.body.setSize(60, 60, 2, 2);
}

ActiveGameObject.prototype = Object.create(StaticGameObject.prototype);
ActiveGameObject.prototype.constructor = ActiveGameObject;
/*s
Phaser.Component.Core.install.call(ActiveGameObject.prototype, [
    'Angle',
    'Animation',
    'AutoCull',
    'Bounds',
    'BringToTop',
    'Destroy',
    'FixedToCamera',
    'Health',
    'InCamera',
    'InputEnabled',
    'InWorld',
    'LifeSpan',
    'LoadTexture',
    'Overlap',
    'PhysicsBody',
    'Reset',
    'Smoothed'
]);

ActiveGameObject.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
ActiveGameObject.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
ActiveGameObject.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
ActiveGameObject.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;*/

ActiveGameObject.prototype.getAction = function(command) {
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

ActiveGameObject.prototype.executeCommand = function(command) {
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

ActiveGameObject.prototype.update = function() {
	if (this.commandDeffer !== null) {
		var distance = this.body.position.distance(this.startPosition);
		
		if (distance >= this.currentAction.stopDistance || (Math.abs(this.body.velocity.x) <= 0.1 && Math.abs(this.body.velocity.y) <= 0.1)) {
			this.stop();
		}
	}
};

ActiveGameObject.prototype.onDeath = function() {
	console.log('Dead', this);
	this.loadTexture(this.deadSprite);
	this.alive = !this.canDie;
	this.body.immovable = true;
	this.stop();
};

ActiveGameObject.prototype.stop = function() {
	console.log('stop', this);
	this.body.velocity.x = 0;
	this.body.velocity.y = 0;
	this.body.immovable = true;
	if (this.commandDeffer !== null) {
		this.commandDeffer();
		this.commandDeffer = null;
	}
};

function Hero(game, x, y) {
	ActiveGameObject.call(this, game, 1, 0, 0, 'hero', 'hero-dead');
	this.x = x;
	this.y = y;
	
	this.canDie = true;
}

Hero.prototype = Object.create(ActiveGameObject.prototype);
Hero.prototype.constructor = Hero;

function Rock(game, x, y) {
	ActiveGameObject.call(this, game, 1, 2, 1, 'rock', 'rock-dead');
	this.x = x;
	this.y = y;
	this.range = 1024;
	
	this.canDie = true;
}

Rock.prototype = Object.create(ActiveGameObject.prototype);
Rock.prototype.constructor = Rock;

function Block(game, x, y) {
	ActiveGameObject.call(this, game, 1, 0, 2, 'block', 'block');
	this.x = x;
	this.y = y;
}

Block.prototype = Object.create(ActiveGameObject.prototype);
Block.prototype.constructor = Block;

Block.prototype.onCollision = function(other) {
	console.log('Hmm', other);
	if (typeof other.stop !== 'undefined') {
		other.stop(this);
	}
};

var tileSize = 64;

function Play() {}

Play.prototype = {
	init: function() {
		this.executing = 0;
		this.commandQueueIndex = 0;
		this.commandQueue = [];
	},
	resetart: function() {
		this.game.state.start('play');
	},
	create: function() {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.map = this.game.add.tilemap('map');
		this.map.addTilesetImage('tiles', 'tiles');
		this.map.setCollisionBetween(1, 64, true);
		this.map.setCollision([37, 60], false);
		
		this.mapTiles = this.map.createLayer('Walls');
		//this.mapCollisions = this.map.createLayer('Collision');
		//this.mapTiles.debug = true;
		
		this.map.setTileIndexCallback(62, function() {
			console.log('block');
			return true;
		}, this);
		
		this.staticGroup = this.game.add.group();
		
		/*for (var x = 0; x < 10; x++) {
			var wall = new Wall(this.game, x * tileSize, tileSize);
			this.staticGroup.add(wall);
		}*/
		
		this.commandableGroup = this.game.add.group();
		
		this.hero = new Hero(this.game, tileSize + 32, tileSize + 32);
		//this.hero = this.game.add.sprite( tileSize, tileSize, 'hero');
		
		this.commandableGroup.add(this.hero);
		
		this.rock1 = new Rock(this.game, tileSize + 32, 3 * tileSize + 32);
		
		this.commandableGroup.add(this.rock1);
		
		this.rock2 = new Rock(this.game, 10 * tileSize + 32, 5 * tileSize + 32);
		
		this.commandableGroup.add(this.rock2);
		
		this.block = new Block(this.game, 4 * tileSize + 32, 3 * tileSize + 32);
		
		this.commandableGroup.add(this.block);
		
		//this.game.physics.enable([ this.commandableGroup, this.mapCollisions ], Phaser.Physics.ARCADE);
		
		this.setupKeyboard();
	},
	setupKeyboard: function() {
		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.resetKey.onDown.add(_.bind(this.resetart, this));
		
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
		
		/*this.commandableGroup.forEachAlive(_.bind(function TestCollisions(obj) {
			this.mapTiles.forEach(_.bind(function TestTile(tile, other) {
				if (tile.data.block && Geometry.intersects(tile.getBounds(), other.getBounds())) {
					other.onCollision(tile);
					this.onTileCollision(tile, other);
				}
			}, this, _, obj));
		}, this));	*/
		
		/*this.commandableGroup.forEachAlive(_.bind(function TestCollisions(obj) {
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
		}, this));*/
		
		//this.game.debug.body(this.hero);
		//this.game.debug.body(this.block);
		
		this.game.physics.arcade.collide(this.mapTiles, this.commandableGroup);
		this.game.physics.arcade.collide(this.commandableGroup, this.commandableGroup, _.bind(this.onCollision, this));
		//this.game.physics.arcade.overlap(this.mapTiles, this.hero, this.onTileCollision);
	},
	onCollision: function(objA, objB) {
		if ((objA.currentAction.x > 0 && objA.body.x < objB.body.x) || (objA.currentAction.x < 0 && objA.body.x > objB.body.x)) {
			objB.hp -= Math.max(objA.dmg - objB.def, 0);
		}
		if ((objB.currentAction.x > 0 && objB.body.x < objA.body.x) || (objB.currentAction.x < 0 && objB.body.x > objA.body.x)) {
			objA.hp -= Math.max(objB.dmg - objA.def, 0);
		}
		if ((objA.currentAction.y > 0 && objA.body.y < objB.body.y) || (objA.currentAction.y < 0 && objA.body.y > objB.body.y)) {
			objB.hp -= Math.max(objA.dmg - objB.def, 0);
		}
		if ((objB.currentAction.y > 0 && objB.body.y < objA.body.y) || (objB.currentAction.y < 0 && objB.body.y > objA.body.y)) {
			objA.hp -= Math.max(objB.dmg - objA.def, 0);
		}
		
		objA.stop();
		objB.stop();
		
		if (objA.hp <= 0) {
			objA.onDeath();
		}
		
		if (objB.hp <= 0) {
			objB.onDeath();
		}
	},
	onTileCollision: function(a, b) {
		console.log('collision', a, b);
	},
	addCommand: function(command) {
		//console.log('new command ', command);
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
		console.log('finished', object.x, object.y, object.body.position);
		object.x = Math.round(object.body.position.x / 64) * 64 + 32;
		object.y = Math.round(object.body.position.y / 64) * 64 + 32;
		console.log('snap', object.body.position);
		//console.log('command executed', this.executing);
	},
	clickListener: function() {
		this.game.state.start('gameover');
	}
};

module.exports = Play;