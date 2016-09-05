'use strict';
/* global Phaser */

function GameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
	Phaser.Sprite.call(this, game, 0, 0, aliveSprite);
	
	this.anchor.setTo(0.5, 0.5);
	this.aliveSprite = aliveSprite;
	this.deadSprite = deadSprite;
	
	// values used to deterimn result of collsions
	this._hp = hp;
	this._hpMax = hp;
	this.dmg = dmg;
	this.def = def;
	
	// how much damage will Game Object suffer from hitting something else
	this.collisionDamage = 0;
	
	// tells if Game Object is and obstacle after death
	this.blocksOnDeath = true;
	// tells if when hp goes to or below 0 Game Object should set it self as inactive
	this.canDie = false;
	// tells if user commands should controll that GameObject
	this.controllable = false;
	// flag checked in collsions with collectable Game objects
	this.canCollect = false;
	
	// insted of using standard arcade collisions we are using mask 
	// for example so that player could move on stairs and othere object not
	// this specific value tell that Game Objects collide with every kind of tile
	this.collisionMask = 31;// everything
	
	this.physicsType = Phaser.SPRITE;
	
	game.physics.enable(this);
	
	this.body.collideWorldBounds = true;
	this.body.bounce.set(0);
	this.body.setSize(56, 56, 4, 4);
}

GameObject.prototype = Object.create(Phaser.Sprite.prototype);
GameObject.prototype.constructor = GameObject;

Object.defineProperty(GameObject.prototype, 'hp', {
	get: function() {
		return this._hp;
	},

	set: function(value) {
		return this._hp = value;
	}
});

module.exports = GameObject;