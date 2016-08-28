'use strict';
var GameObject = require('./game_object.js');

function Techcard(game, x, y) {
	GameObject.call(this, game, 0, 0, 0, 'techcard', 'techcard');
	this.x = x;
	this.y = y;
}

Techcard.prototype = Object.create(GameObject.prototype);
Techcard.prototype.constructor = Techcard;

Techcard.prototype.collect = function() {
	this.parent.remove(this);
};

module.exports = Techcard;