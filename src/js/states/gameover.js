'use strict';

function GameOver() {}

GameOver.prototype = {
	preload: function () {
	
	},
	create: function () {
		this.titleLabel = this.game.add.text(this.game.world.centerX,100, 'Game Over!', { font: '65px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.titleLabel.anchor.setTo(0.5, 0.5);

		this.congratsLabel = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.congratsLabel.anchor.setTo(0.5, 0.5);

		this.instructionLabel = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.instructionLabel.anchor.setTo(0.5, 0.5);
	},
	update: function () {
		if(this.game.input.activePointer.justPressed()) {
			this.game.state.start('play');
		}
	}
};
module.exports = GameOver;
