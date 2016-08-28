'use strict';
/* global Phaser */
var _ = require('lodash');
var Techcard = require('../components/techcard.js');
var Hero = require('../components/hero.js');
var Rock = require('../components/rock.js');
var Block = require('../components/block.js');
var Bow = require('../components/bow.js');
var Arrow = require('../components/arrow.js');

function Play() {}

Play.prototype = {
	init: function(level) {
		this.level = level;
		
		this.executing = 0;
		this.commandQueueIndex = 0;
		this.commandQueue = [];
		this.startPosition = { x: 0, y: 0};
		
		this.collectedAmount = 0;
		this.collectableAmount = 0;
	},
	menu: function() {
		this.game.state.start('menu');
	},
	resetart: function() {
		this.game.state.start('play', true, false, this.level);
	},
	end: function() {
		this.game.state.start('gameover', true, false, {
			level: this.level,
			collectedAmount: this.collectedAmount,
			collectableAmount: this.collectableAmount
		});
	},
	death: function() {
		this.game.add.tween(this.world).to({ alpha: 0}, 100, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		
		this.game.input.keyboard.onDownCallback = null;
		this.game.input.keyboard.onUpCallback = null;
		this.game.time.events.add(Phaser.Timer.SECOND, _.bind(this.resetart, this));
	},
	create: function() {
		//this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.map = this.game.add.tilemap(this.level);
		this.map.addTilesetImage('tiles', 'tiles');
		this.mapTiles = this.map.createLayer('Layout');
		//this.mapTiles.debug = true;
		
		this.collectableGroup = this.game.add.group();
		this.exitsGroup = this.game.add.group();
		this.arrowsGroup = this.game.add.group();
		this.commandableGroup = this.game.add.group();
		
		var objectsLayer = this.map.layers[this.map.getLayerIndex('Objects')];
		//this.hearos = [];
		//this.arrows = [];
		this.heroesCount = 0;
		
		var gameObject = null;
		this.game.world.setBounds(-16, 0, 800, 600);
		//this.game.camera.x = -40;
		
		_.each(objectsLayer.data, _.bind(function(row) {
			_.each(row, _.bind(function(tile) {
				if (typeof tile.properties.type !== 'undefined') {
					switch (tile.properties.type) {
						case 'Hero':
							this.hero = new Hero(this.game, tile.worldX + 32, tile.worldY + 32);
							//this.hearos.push(hero);
							this.startPosition = _.clone(this.hero.body.position);
							this.heroesCount ++;
							this.commandableGroup.add(this.hero);
							this.game.add.tween(this.hero).from({ alpha: 0, y: -64}, 100 * (this.hero.y / 64), Phaser.Easing.Linear.NONE, true, 200, 0, false);
							
							this.hero.afterDeath.add(_.bind(this.death, this));
							break;
						case 'Rock':
							gameObject = new Rock(this.game, tile.worldX + 32, tile.worldY + 32);
							this.commandableGroup.add(gameObject);
							this.game.add.tween(gameObject).from({ alpha: 0, y: gameObject.y - 64}, 200, Phaser.Easing.Linear.NONE, true, 500 + tile.x * 50, 0, false);
							break;
						case 'Block':
							gameObject = new Block(this.game, tile.worldX + 32, tile.worldY + 32);
							this.commandableGroup.add(gameObject);
							this.game.add.tween(gameObject).from({ alpha: 0, y: gameObject.y - 64}, 200, Phaser.Easing.Linear.NONE, true, 500 + tile.x * 50, 0, false);
							break;
						case 'Bow':
							var arrow = new Arrow(this.game, tile.worldX + 32, tile.worldY + 32);
							//this.arrows.push(arrow);
							this.arrowsGroup.add(arrow);
							
							gameObject = new Bow(this.game, tile.worldX + 32, tile.worldY + 32, arrow, tile.properties.direction);
							this.commandableGroup.add(gameObject);
							break;
						case 'Techcard':
							gameObject = new Techcard(this.game, tile.worldX + 32, tile.worldY + 32);
							this.collectableAmount ++;
							this.collectableGroup.add(gameObject);
							this.game.add.tween(gameObject).from({ alpha: 0, y: gameObject.y - 64}, 200, Phaser.Easing.Linear.NONE, true, 500 + tile.x * 50, 0, false);
							break;
						case 'Exit':
							gameObject = this.game.add.sprite(tile.worldX, tile.worldY, 'lock');
							this.exitsGroup.add(gameObject);
							this.game.add.tween(gameObject).from({ alpha: 0, y: gameObject.y - 64}, 200, Phaser.Easing.Linear.NONE, true, 500 + tile.x * 50, 0, false);
							break;
					}
				}
			}, this));
		}, this));
		
		this.game.add.tween(this.mapTiles).from({ alpha: 0}, 500, Phaser.Easing.Linear.NONE, true, 100 * (this.hero.y / 64), 0, false);
		this.game.add.tween(this.world).to({ alpha: 1}, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		
		this.createInterface();
		
		this.game.time.events.add(Phaser.Timer.SECOND * 1.1, _.bind(this.setupKeyboard, this));
	},
	createInterface: function() {
		this.scoreLabel = this.game.add.text(
			this.game.world.centerX, 
			10, 
			'Techcards collected: ' + this.collectedAmount + ' / ' + this.collectableAmount, 
			{ font: '24px ' + this.game.theme.font, fill: '#ffffff', align: 'center'}
		);
		this.scoreLabel.anchor.setTo(0.5, 0);
		this.scoreLabel.fixedToCamera = true;
		
		this.scoreLabelTween = this.game.add.tween(this.scoreLabel).from({ y: 0 }, 200, Phaser.Easing.Linear.NONE, false, 0, 1, false)
			.chain(this.game.add.tween(this.scoreLabel).to({ y: 10 }, 200, Phaser.Easing.Linear.NONE, false, 0, 0, false));
		this.scoreLabelTween.onComplete.add(_.bind(this.updateInterface, this));
		
		this.infoLabel = this.game.add.text(
			this.game.world.width - 10, 
			this.game.world.height - 10, 
			'press R to restart\npress Esc to get back to menu', 
			{ font: '18px ' + this.game.theme.font, fill: '#ffffff', align: 'right'}
		);
		this.infoLabel.anchor.setTo(1, 1);
		this.infoLabel.fixedToCamera = true;		
		
		this.infoLabel = this.game.add.text(
			10, 
			this.game.world.height - 10, 
			'Use asdw or keys to move\nCollect all techcards to open passage to next level!', 
			{ font: '18px ' + this.game.theme.font, fill: '#ffffff', align: 'left'}
		);
		this.infoLabel.anchor.setTo(0, 1);
		this.infoLabel.fixedToCamera = true;
	},
	updateInterface: function() {
		
		//this.scoreLabel.y = 10;
		if (this.collectedAmount === this.collectableAmount) {
			this.scoreLabel.text = '"Gates" are defeted!';
			
			this.game.add.tween(this.exitsGroup).to({ alpha: 0, y: -64 }, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
			
		} else {
			this.scoreLabel.text = 'Techcards collected: ' + this.collectedAmount + ' / ' + this.collectableAmount;
		}
	},
	setupKeyboard: function() {
		// console.log('setup keyboard');
		
		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.resetKey.onDown.add(_.bind(this.resetart, this));
		
		this.menuKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.menuKey.onDown.add(_.bind(this.menu, this));
		
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
		
		this.game.debug.body(this.arrowsGroup);
		this.game.debug.body(this.collectableGroup);
		
		//_.each(this.hearos, _.bind(function(obj) {this.game.debug.body(obj);}, this));
		//_.each(this.arrows, _.bind(function(obj) {this.game.debug.body(obj);}, this));
		//this.game.debug.cameraInfo(this.game.camera, 32, 32);
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
		} else if (tile.properties.type === 'Exit') {
			if (this.collectableAmount === this.collectedAmount) {
				obj.stop();
				obj.parent.remove(obj);

				this.heroesCount --;

				if (this.heroesCount === 0) {
					this.end();
				}
			} else {
				if (typeof this.scoreLabelTween === 'undefined' || !this.scoreLabelTween.isRunning) {
					console.log('not end');
					this.scoreLabel.y = 10;
					this.scoreLabelTween.start();
				}
			}
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
		//console.log('onCollectableCollision', obj, collectable);
		
		if (obj.canCollect) {
			collectable.collect();
			this.collectedAmount ++;
			this.updateInterface();
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
	shutdown: function() {
		// console.log('shutdown');
		this.game.input.keyboard.onDownCallback = null;
		this.game.input.keyboard.onUpCallback = null;
	}
};

module.exports = Play;