'use strict';
var ControllableGameObject = require('./controllable_game_object.js');

function Bow(game, x, y, arrow, direction) {
	ControllableGameObject.call(this, game, 2, 0, 2, 'bow', 'bow');
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

Bow.prototype = Object.create(ControllableGameObject.prototype);
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
			action.x = this.x - this.arrow.body.width / 2 + 48;
			action.y = this.y - this.arrow.body.height / 2;
			action.type = 'right';
			break;
		case 'L':
			action.x = this.x - this.arrow.body.width / 2 - 48;
			action.y = this.y - this.arrow.body.height / 2;
			action.type = 'left';
			break;
		case 'U':
			action.x = this.x - this.arrow.body.width / 2;
			action.y = this.y - this.arrow.body.height / 2 - 48;
			action.type = 'up';
			break;
		case 'B':
			action.x = this.x - this.arrow.body.width / 2;
			action.y = this.y - this.arrow.body.height / 2 + 48;
			action.type = 'down';
			break;
	}
	
	return action;
};

module.exports = Bow;