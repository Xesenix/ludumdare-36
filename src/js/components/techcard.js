'use strict';
var GameObject = require('./game_object.js');

// collectible Game object responsible for opening doors to next level
function Techcard(game, x, y) {
	GameObject.call(this, game, 0, 0, 0, 'techcard', 'techcard');
	this.x = x;
	this.y = y;
	
	this.body.setSize(24, 24, 24, 24);
}

Techcard.prototype = Object.create(GameObject.prototype);
Techcard.prototype.constructor = Techcard;

Techcard.prototype.collect = function() {
	this.parent.remove(this);
};

module.exports = Techcard;