'use strict';
/* global Phaser */
var _ = require('lodash');
var Promise = require('promise');

function StaticGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	Phaser.Sprite.call(this, game, 0, 0, aliveSprite);
	
	this.anchor.setTo(0.5, 0.5);
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this._hp = hp;
	this._hpMax = hp;
	this.dmg = dmg;
	this.def = def;
	
	this.blocksOnDeath = true;
	this.canDie = false;
	this.controllable = false;
	this.canCollect = false;
	
	this.collisionMask = 31;// everything
	
	this.physicsType = Phaser.SPRITE;
	
	game.physics.enable(this);
	
	this.body.collideWorldBounds = true;
	this.body.bounce.set(0);
	this.body.setSize(62, 62, 1, 1);
}

StaticGameObject.prototype = Object.create(Phaser.Sprite.prototype);
StaticGameObject.prototype.constructor = StaticGameObject;

Object.defineProperty(StaticGameObject.prototype, 'hp', {
    get: function() {
        return this._hp;
    },

    set: function(value) {
		//console.log('HP:', value, this);
        return this._hp = value;
    }
});

function Techcard(game, x, y) {
	StaticGameObject.call(this, game, 0, 0, 0, 'techcard', 'techcard');
	this.x = x;
	this.y = y;
}

Techcard.prototype = Object.create(StaticGameObject.prototype);
Techcard.prototype.constructor = Techcard;

Techcard.prototype.collect = function() {
	this.alpha = 0;
};

function ActiveGameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	StaticGameObject.call(this, game,  hp, dmg, def, aliveSprite, deadSprite);
	
	this.commandQueueIndex = 0;
	this.commandQueue = [];
	this.currentAction = null;
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	this.hp = hp;
	this.dmg = dmg;
	this.def = def;
	this.collisionDmg = 0;
	this.speed = 512;
	this.range = 64;
	
	this.controllable = true;
	this.commandDeffer = null;
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

ActiveGameObject.prototype.update = function() {
	if (this.commandDeffer !== null) {
		var distance = this.body.position.distance(this.startPosition);
		
		if (distance >= this.currentAction.stopDistance || (Math.abs(this.body.velocity.x) <= 0.1 && Math.abs(this.body.velocity.y) <= 0.1)) {
			this.stop();
		}
	}
};

ActiveGameObject.prototype.onDeath = function() {
	// console.log('Dead', this);
	this.loadTexture(this.deadSprite);
	this.alive = !this.canDie;
	this.body.immovable = true;
	this.stop();
};

ActiveGameObject.prototype.stop = function() {
	// console.log('stop', this);
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
	
	this.blocksOnDeath = false;
	this.canDie = true;
	this.canCollect = true;
	
	this.collisionMask = 1;// walls
}

Hero.prototype = Object.create(ActiveGameObject.prototype);
Hero.prototype.constructor = Hero;

function Rock(game, x, y) {
	ActiveGameObject.call(this, game, 2, 2, 1, 'rock', 'rock-dead');
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

function Arrow(game, x, y) {
	ActiveGameObject.call(this, game, 1, 1, 0, 'arrow', 'arrow-dead');
	this.x = x;
	this.y = y;
	this.range = 1024;
	this.blocksOnDeath = false;
	this.controllable = false;
	
	this.collisionDmg = 1;
	
	this.body.setSize(32, 54, 0, 0);
}

Arrow.prototype = Object.create(ActiveGameObject.prototype);
Arrow.prototype.constructor = Arrow;

function Bow(game, x, y, arrow, direction) {
	ActiveGameObject.call(this, game, 2, 0, 2, 'bow', 'bow');
	this.x = x;
	this.y = y;
	this.arrow = arrow;
	this.arrow.alpha = 0;
	
	this.direction = direction || 'D';
	switch (this.direction) {
		case 'R':
			this.angle = -90;
			break;
		case 'L':
			this.angle = 90;
			break;
		case 'U':
			this.angle = 180;
			break;
		case 'D':
			this.angle = 0;
			break;
	}
}

Bow.prototype = Object.create(ActiveGameObject.prototype);
Bow.prototype.constructor = Bow;

Bow.prototype.executeCommand = function() {
	var action = this.getAction(this.direction);
	this.arrow.body.x = action.x;
	this.arrow.body.y = action.y;
	this.arrow.angle = action.angle;
	this.arrow.alive = true;
	this.arrow.alpha = 1;
	this.arrow.loadTexture(this.arrow.aliveSprite);
	
	//action.x = Math.max(Math.min(action.x, 800 - 32), 32);
	//action.y = Math.max(Math.min(action.y, 600 - 32), 32);
	
	//var distance = Math.max(Math.abs(this.x - action.x), Math.abs(this.y - action.y)) / 64;
	
	return this.arrow.executeCommand(action.type);
};

Bow.prototype.getAction = function(command) {
	var action = {
		angle: this.angle
	};
	switch (command) {
		case 'R':
			action.x = this.x + 32;
			action.y = this.y - 32;
			action.type = 'right';
			break;
		case 'L':
			action.x = this.x - 96;
			action.y = this.y - 32;
			action.type = 'left';
			break;
		case 'U':
			action.x = this.x - 32;
			action.y = this.y - 96;
			action.type = 'up';
			break;
		case 'B':
			action.x = this.x - 32;
			action.y = this.y + 32;
			action.type = 'down';
			break;
	}
	
	return action;
};


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
		if (typeof this.game.music === 'undefined') {
			this.game.music = this.game.add.audio('melody');

			this.game.music.loopFull();
		}
		
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.map = this.game.add.tilemap('level-4');
		this.map.addTilesetImage('tiles', 'tiles');
		//this.map.setCollisionBetween(1, 64, true);
		//this.map.setCollision([37, 45, 53, 54, 55, 60], false);
		this.mapTiles = this.map.createLayer('Layout');
		//this.mapObjects = this.map.createLayer('Objects');
		//this.mapCollisions = this.map.createLayer('Collision');
		//this.mapTiles.debug = true;
		
		
		this.collectableGroup = this.game.add.group();
		this.arrowsGroup = this.game.add.group();
		this.commandableGroup = this.game.add.group();
		
		var objectsLayer = this.map.layers[this.map.getLayerIndex('Objects')];
		
		_.each(objectsLayer.data, _.bind(function(row) {
			_.each(row, _.bind(function(tile) {
				if (typeof tile.properties.type !== 'undefined') {
					switch (tile.properties.type) {
						case 'Hero':
							this.commandableGroup.add(new Hero(this.game, tile.worldX + 32, tile.worldY + 32));
							break;
						case 'Rock':
							this.commandableGroup.add(new Rock(this.game, tile.worldX + 32, tile.worldY + 32));
							break;
						case 'Block':
							this.commandableGroup.add(new Block(this.game, tile.worldX + 32, tile.worldY + 32));
							break;
						case 'Bow':
							var arrow = new Arrow(this.game, tile.worldX + 32, tile.worldY + 32);
							this.arrowsGroup.add(arrow);
							this.commandableGroup.add(new Bow(this.game, tile.worldX + 32, tile.worldY + 32, arrow, tile.properties.direction));
							break;
						case 'Techcard':
							this.collectableGroup.add(new Techcard(this.game, tile.worldX + 32, tile.worldY + 32));
							break;
					}
				}
			}, this));
		}, this));
		
		//var arrow = new Arrow(this.game, 3 * 64 + 32, 32);
		//this.commandableGroup.add(arrow);
		//this.commandableGroup.add(new Bow(this.game, 3 * 64 + 32, 32, arrow));
		
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
		
		//console.log('executing ', this.executing, this.commandQueueIndex, this.commandQueue);
	},
	onKeyboardUp: function () {
	},
	update: function() {
		if (this.executing === 0 && this.commandQueue.length > this.commandQueueIndex) {
			this.commandableGroup.forEachAlive(this.startObjectCommand, this);
			this.commandQueueIndex ++;
		}
		
		// use overlap for checking collision groups  
		this.game.physics.arcade.overlap(this.mapTiles, this.commandableGroup, _.bind(this.onTileCollision, this));
		this.game.physics.arcade.overlap(this.mapTiles, this.arrowsGroup, _.bind(this.onArrowTileCollision, this));
		
		this.game.physics.arcade.overlap(this.commandableGroup, this.arrowsGroup, _.bind(this.onArrowCollision, this));
		this.game.physics.arcade.overlap(this.commandableGroup, this.commandableGroup, _.bind(this.onCollision, this));
		
		this.game.physics.arcade.overlap(this.commandableGroup, this.collectableGroup, _.bind(this.onCollectableCollision, this));
	},
	onArrowCollision: function(obj, arrow) {
		//console.log('onArrowCollision', obj, arrow);
		arrow.onDeath();
		
		obj.hp -= Math.max(arrow.dmg - obj.def, 0);
		
		if (obj.hp <= 0) {
			obj.onDeath();
		}
	},
	onArrowTileCollision: function(arrow, tile) {
		//console.log('onArrowTileCollision', tile, arrow);
		if (parseInt(tile.properties.collisionGroup | 0) & arrow.collisionMask) {
			arrow.onDeath();
		}
	},
	onTileCollision: function(obj, tile) {
		//a.stop();
		//console.log('collision', obj, tile);
		if (parseInt(tile.properties.collisionGroup | 0) & obj.collisionMask) {
			obj.stop();
		}
	},
	onCollision: function(objA, objB) {
		if (objA.hp <= 0 && !objA.blocksOnDeath) {
			return;
		}
		
		if (objB.hp <= 0 && !objB.blocksOnDeath) {
			return;
		}
		
		if (objA.currentAction !== null) {
			if ((objA.currentAction.x > 0 && objA.body.x < objB.body.x) || (objA.currentAction.x < 0 && objA.body.x > objB.body.x)) {
				objB.hp -= Math.max(objA.dmg - objB.def, 0);
			}
			if ((objA.currentAction.y > 0 && objA.body.y < objB.body.y) || (objA.currentAction.y < 0 && objA.body.y > objB.body.y)) {
				objB.hp -= Math.max(objA.dmg - objB.def, 0);
			}
			objA.hp -= objA.collisionDmg;
			objA.stop();
		}
		if (objB.currentAction !== null) {
			if ((objB.currentAction.x > 0 && objB.body.x < objA.body.x) || (objB.currentAction.x < 0 && objB.body.x > objA.body.x)) {
				objA.hp -= Math.max(objB.dmg - objA.def, 0);
			}
			if ((objB.currentAction.y > 0 && objB.body.y < objA.body.y) || (objB.currentAction.y < 0 && objB.body.y > objA.body.y)) {
				objA.hp -= Math.max(objB.dmg - objA.def, 0);
			}
			objB.hp -= objA.collisionDmg;
			objB.stop();
		}
		
		if (objA.hp <= 0) {
			objA.onDeath();
		}
		
		if (objB.hp <= 0) {
			objB.onDeath();
		}
	},
	onCollectableCollision: function(obj, collectable) {
		console.log('onCollectableCollision', obj, collectable);
		
		if (obj.canCollect) {
			collectable.collect();
		}
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
		// console.log('finished', object.x, object.y, object.body.position);
		object.x = Math.round(object.body.position.x / 64) * 64 + 32;
		object.y = Math.round(object.body.position.y / 64) * 64 + 32;
		// console.log('snap', object.body.position);
		// console.log('command executed', this.executing);
	},
	clickListener: function() {
		this.game.state.start('gameover');
	}
};

module.exports = Play;