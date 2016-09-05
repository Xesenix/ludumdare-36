'use strict';
/* global Phaser */
var _ = require('lodash');
var Techcard = require('../components/techcard.js');
var Hero = require('../components/hero.js');
var Rock = require('../components/rock.js');
var Block = require('../components/block.js');
var Bow = require('../components/bow.js');
var Arrow = require('../components/arrow.js');

var Swipe = require('phaser-swipe');

var MuteButton = require('../components/mute_button.js');

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
		// player requested menu transition
		this.game.state.start('menu');
	},
	resetart: function() {
		// player requested restart
		this.game.state.start('play', true, false, this.level);
	},
	end: function() {
		// display level finished state
		this.game.state.start('gameover', true, false, {
			level: this.level,
			collectedAmount: this.collectedAmount,
			collectableAmount: this.collectableAmount,
			numberOfSteps: this.commandQueueIndex,
		});
	},
	death: function() {
		// start death transition
		this.game.add.tween(this.world).to({ alpha: 0}, 100, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		
		// turn of controls
		this.swipe = null;
		this.game.input.keyboard.onDownCallback = null;
		this.game.input.keyboard.onUpCallback = null;
		this.game.time.events.add(Phaser.Timer.SECOND, _.bind(this.resetart, this));
	},
	create: function() {
		// this.game.physics.startSystem(Phaser.Physics.ARCADE);
		
		this.map = this.game.add.tilemap(this.level);
		this.map.addTilesetImage('tiles', 'tiles');
		this.mapTiles = this.map.createLayer('Layout');
		// this.mapTiles.debug = true;
		
		this.collectableGroup = this.game.add.group();
		this.exitsGroup = this.game.add.group();
		this.arrowsGroup = this.game.add.group();
		this.commandableGroup = this.game.add.group();
		
		var objectsLayer = this.map.layers[this.map.getLayerIndex('Objects')];
		this.heroesCount = 0;
		
		// center tiles
		this.game.world.setBounds(-16, 0, 800, 600);
		
		var gameObject = null;
		
		_.each(objectsLayer.data, _.bind(function(row) {
			_.each(row, _.bind(function(tile) {
				if (typeof tile.properties.type !== 'undefined') {
					switch (tile.properties.type) {
						case 'Hero':
							this.hero = new Hero(this.game, tile.worldX + 32, tile.worldY + 32);
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
		
		// start fade in of level
		this.game.add.tween(this.mapTiles).from({ alpha: 0}, 500, Phaser.Easing.Linear.NONE, true, 100 * this.hero.y / 64, 0, false);
		this.game.add.tween(this.world).to({ alpha: 1}, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
		
		this.createInterface();
		
		this.game.time.events.add(Phaser.Timer.SECOND * 1.1, _.bind(this.setupKeyboard, this));
	},
	createInterface: function() {
		// remember to make interface elements fixedToCamera = true
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
			'Use asdw or keys to move, you can also swipe mouse left, right, up, down\nCollect all techcards to open passage to next level!', 
			{ font: '18px ' + this.game.theme.font, fill: '#ffffff', align: 'left'}
		);
		this.infoLabel.anchor.setTo(0, 1);
		this.infoLabel.fixedToCamera = true;
		
		this.restartButton = this.game.add.button(56 + 10 * 64, 24, 'restart', _.bind(this.resetart, this));
		this.restartButton.anchor.setTo(0.5, 0.5);
		this.restartButton.width = 32;
		this.restartButton.height = 32;
		
		this.menuButton = this.game.add.button(40 + 11 * 64, 24, 'close', _.bind(this.menu, this));
		this.menuButton.anchor.setTo(0.5, 0.5);
		this.menuButton.width = 32;
		this.menuButton.height = 32;
		
		this.muteButton = new MuteButton(this.game, 24, 24, 'mute');
		this.muteButton.anchor.setTo(0.5, 0.5);
		this.muteButton.width = 32;
		this.muteButton.height = 32;
		
		this.world.add(this.muteButton);
	},
	updateInterface: function() {
		// actualize iterface displayed values
		if (this.collectedAmount === this.collectableAmount) {
			this.scoreLabel.text = '"Gates" are defeted!\nnumber of steps: ' + this.commandQueueIndex;
			
			this.game.add.tween(this.exitsGroup).to({ alpha: 0, y: -64 }, 500, Phaser.Easing.Linear.NONE, true, 0, 0, false);
			
		} else {
			this.scoreLabel.text = 'Techcards collected: ' + this.collectedAmount + ' / ' + this.collectableAmount + '\nnumber of steps: ' + this.commandQueueIndex;
		}
	},
	setupKeyboard: function() {
		// console.log('setup keyboard');
		
		this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
		this.resetKey.onDown.add(_.bind(this.resetart, this));
		
		this.menuKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		this.menuKey.onDown.add(_.bind(this.menu, this));
		
		// turn on keyboard inputs
		this.game.input.keyboard.onDownCallback = _.bind(this.onKeyboardDown, this);
		
		// fixes browser scrolling - but when we use swipe this is not nesesary
		// this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);
		
		// setup swipe commands
		this.swipe = new Swipe(this.game, {
			left: _.bind(this.addCommand, this, 'left'),
			right: _.bind(this.addCommand, this, 'right'),
			up: _.bind(this.addCommand, this, 'up'),
			down: _.bind(this.addCommand, this, 'down')
		});
	},
	onKeyboardDown: function () {
		var keyboard = this.game.input.keyboard;
		
		// check for keyboard input
		if (keyboard.isDown(Phaser.Keyboard.A)) {
			this.addCommand('left');
		} else if (keyboard.isDown(Phaser.Keyboard.D)) {
			this.addCommand('right');
		} else if (keyboard.isDown(Phaser.Keyboard.W)) {
			this.addCommand('up');
		} else if (keyboard.isDown(Phaser.Keyboard.S)) {
			this.addCommand('down');
		}
		
		// console.log('executing ', this.executing, this.commandQueueIndex, this.commandQueue);
	},
	update: function() {
		// console.log('-------update---------');
		
		// check for mouse input
		if (this.swipe != null) {
			this.swipe.check();
		}
		
		// check if all GameObjects finished transit to new turn and if yes and we have more commands start next turn transition
		if (this.executing === 0 && this.commandQueue.length > this.commandQueueIndex) {
			this.commandableGroup.forEachAlive(this.startObjectCommand, this);
			this.commandQueueIndex ++;
			this.updateInterface();
		}
		
		// use overlap for checking collision groups so we can decide what collides and what does not 
		
		this.game.physics.arcade.overlap(this.mapTiles, this.commandableGroup, _.bind(this.onTileCollision, this));
		this.game.physics.arcade.overlap(this.mapTiles, this.arrowsGroup, _.bind(this.onArrowTileCollision, this));
		
		this.game.physics.arcade.overlap(this.commandableGroup, this.arrowsGroup, _.bind(this.onArrowCollision, this));
		this.game.physics.arcade.overlap(this.commandableGroup, this.commandableGroup, _.bind(this.onCollision, this));
		this.game.physics.arcade.overlap(this.commandableGroup, this.collectableGroup, _.bind(this.onCollectableCollision, this));
		
		// _.each(this.commandableGroup, _.bind(function(obj) {this.game.debug.body(obj);}, this));
		// _.each(this.arrows, _.bind(function(obj) {this.game.debug.body(obj);}, this));
		// this.game.debug.cameraInfo(this.game.camera, 32, 32);
	},
	onArrowCollision: function(obj, arrow) {
		// for simplification seperate loop for collisions with arrows
		if (arrow.alive) {
			arrow.onDeath();

			obj.hp -= Math.max(arrow.dmg - obj.def, 0);

			if (obj.hp <= 0) {
				obj.onDeath();
			}
		}
	},
	onArrowTileCollision: function(arrow, tile) {
		// console.log('onArrowTileCollision', tile, arrow);
		if (parseInt(tile.properties.collisionGroup | 0) & arrow.collisionMask) {
			arrow.onDeath();
		}
	},
	onTileCollision: function(obj, tile) {
		// as we do not se arcade collsions but only check for overlaping we can decide if tile should be movable for game object
		// in thise way we can for example enable player to move on stairs and othere objects not
		// we use binary operator & for checking collisions
		if (parseInt(tile.properties.collisionGroup | 0) & obj.collisionMask) {
			obj.stop();
			return false;
		} else if (tile.properties.type === 'Exit') {
			// if player entered exit check if he collected all keys 
			if (this.collectableAmount === this.collectedAmount) {
				obj.stop();
				obj.parent.remove(obj);

				this.heroesCount --;

				if (this.heroesCount === 0) {
					// if all heros left level we can finish it
					this.end();
				}
			} else {
				// if not animate score label to indicate that more keys are needed
				if (typeof this.scoreLabelTween === 'undefined' || !this.scoreLabelTween.isRunning) {
					this.scoreLabel.y = 10;
					this.scoreLabelTween.start();
				}
			}
		}
		
		return true;
	},
	onCollision: function(objA, objB) {
		// that is probably most complicated part of game movment
		// check what hit what and decide who should suffer injury
		// console.log('collision', objA.index, objB.index);
		if (objA.currentAction !== null) {
			if ((objA.currentAction.x > 0 && objA.body.x < objB.body.x) || (objA.currentAction.x < 0 && objA.body.x > objB.body.x)) {
				objB.hp -= Math.max(objA.dmg - objB.def, 0);
			}
			if ((objA.currentAction.y > 0 && objA.body.y < objB.body.y) || (objA.currentAction.y < 0 && objA.body.y > objB.body.y)) {
				objB.hp -= Math.max(objA.dmg - objB.def, 0);
			}
			objA.hp -= objA.collisionDamage;

		}
		if (objB.currentAction !== null) {
			if ((objB.currentAction.x > 0 && objB.body.x < objA.body.x) || (objB.currentAction.x < 0 && objB.body.x > objA.body.x)) {
				objA.hp -= Math.max(objB.dmg - objA.def, 0);
			}
			if ((objB.currentAction.y > 0 && objB.body.y < objA.body.y) || (objB.currentAction.y < 0 && objB.body.y > objA.body.y)) {
				objA.hp -= Math.max(objB.dmg - objA.def, 0);
			}
			objB.hp -= objB.collisionDamage;
		}
		
		if (objB.hit === objA) {
			// this was second collision check
			objB.hit = null;
		} else {
			// this was first collision remember it
			objA.hit = objB;
		}
		objA.stop();
		objB.stop();
	},
	onCollectableCollision: function(obj, collectable) {
		// simplified collisions with Techcards as we have only one type of collectible items
		if (obj.canCollect) {
			collectable.collect();
			this.collectedAmount ++;
			this.updateInterface();
		}
	},
	addCommand: function(command) {
		// after player interaction add his command to buffor (max 2)
		if (this.commandQueue.length < this.commandQueueIndex + 3) {
			this.commandQueue.push(command);
			this.enabled = false;
		}
	},
	startObjectCommand: function(object) {
		// for each controllable start executing transition to next turn
		if (object.controllable) {
			// semaphore for number of GameObjects running transition to next turn
			this.executing ++;
			object.executeCommand(this.commandQueue[this.commandQueueIndex]).then(_.bind(this.onObjectCommandFinish, this, object));
		}
	},
	onObjectCommandFinish: function(object, action) {
		// we need snap player to tile center we do it with smooth tween
		object.body.position.x = Math.round((object.body.position.x - 32 + object.body.halfWidth - 30 * action.x / object.speed) / 64) * 64 + (32 - object.body.halfWidth);
		object.body.position.y = Math.round((object.body.position.y - 32 + object.body.halfHeight - 30 * action.y / object.speed) / 64) * 64 + (32 - object.body.halfHeight);
		
		var target = {
			x: object.body.position.x + object.body.halfWidth, 
			y: object.body.position.y + object.body.halfHeight
		};
		
		if (target.x !== object.x || target.y !== object.y) {
			var tween = this.game.add.tween(object).to(target,
				100,
				Phaser.Easing.Linear.NONE,
				true,
				0,
				0,
				false
			);
			tween.onComplete.add(_.bind(function() {
				// semaphore for number of GameObjects running transition to next turn
				-- this.executing;
			}, this), this);
			// object.hit = null;
			this.game.physics.arcade.overlap(object, this.commandableGroup, _.bind(this.onCollision, this));
		} else {
			// no snapping needed
			// semaphore for number of GameObjects running transition to next turn
			-- this.executing;
		}
	},
	shutdown: function() {
		// clean up references and tweens
		this.game.input.keyboard.onDownCallback = null;
		this.game.input.keyboard.onUpCallback = null;
		
		if (this.scoreLabelTween) {
			this.scoreLabelTween.onComplete.removeAll();
			this.scoreLabelTween.stop();
			this.scoreLabelTween = null;
		}
		
		this.commandableGroup.destroy();
		this.commandableGroup = null;
		
		this.arrowsGroup.destroy();
		this.arrowsGroup = null;
		
		this.collectableGroup.destroy();
		this.collectableGroup = null;
		
		this.exitsGroup.destroy();
		this.exitsGroup = null;
		
		if (this.resetKey) {
			this.resetKey.onDown.removeAll();
			this.resetKey = null;
		}
		
		if (this.menuKey) {
			this.menuKey.onDown.removeAll();
			this.menuKey = null;
		}
		
		this.swipe = null;
		
		this.scoreLabel.kill();
		this.scoreLabel = null;
		
		this.muteButton.kill();
		this.muteButton = null;
		
		this.restartButton.kill();
		this.restartButton = null;
		
		this.menuButton.kill();
		this.menuButton = null;
		
		this.infoLabel.kill();
		this.infoLabel = null;
		
		this.mapTiles = null;
	}
};

module.exports = Play;