'use strict';
/* global Phaser */

function GameObject(game, hp, dmg, def, aliveSprite, deadSprite) {
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
	this.body.setSize(56, 56, 4, 4);
}

GameObject.prototype = Object.create(Phaser.Sprite.prototype);
GameObject.prototype.constructor = GameObject;

Object.defineProperty(GameObject.prototype, 'hp', {
	get: function() {
		return this._hp;
	},

	set: function(value) {
		//console.log('HP:', value, this);
		return this._hp = value;
	}
});

module.exports = GameObject;