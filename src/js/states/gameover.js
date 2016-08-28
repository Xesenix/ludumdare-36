'use strict';
/* global localStorage */
var _ = require('lodash');
var LabelButton = require('../components/label_button.js');

function GameOver() {}

GameOver.prototype = {
	init: function(result) {
		this.result = result;
		
		this.levelInfo = this.game.levels[this.result.level];
		this.game.progress[this.levelInfo.next] = true;

		localStorage.setItem('save', JSON.stringify(this.game.progress));
	},
	preload: function () {
	
	},
	create: function () {

		this.storyLabel = this.game.add.text(this.game.world.centerX, 300, this.levelInfo.story, { font: '24px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.storyLabel.anchor.setTo(0.5, 0.5);
		var button = null;
		
		if (this.levelInfo.next !== null) {
			this.titleLabel = this.game.add.text(this.game.world.centerX,100, 'Level finished!', { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.titleLabel.anchor.setTo(0.5, 0.5);

			this.congratsLabel = this.game.add.text(this.game.world.centerX, 200, 'Next level unlocked!', { font: '32px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.congratsLabel.anchor.setTo(0.5, 0.5);
			
			button = new LabelButton(this.game, this.world.centerX - 10, 400, 'btn', 'Next', _.bind(this.next, this));
			button.anchor.setTo(1, 0);
			button.width = 128;	
			button.height = 48;
			button.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(button);
			
			button = new LabelButton(this.game, this.world.centerX + 10, 400, 'btn', 'Menu', _.bind(this.menu, this));
			button.anchor.setTo(0, 0);
			button.width = 128;	
			button.height = 48;
			button.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(button);
		} else {		
			this.titleLabel = this.game.add.text(this.game.world.centerX,100, 'Victory!', { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.titleLabel.anchor.setTo(0.5, 0.5);

			this.congratsLabel = this.game.add.text(this.game.world.centerX, 200, 'Thank you for playing!', { font: '32px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.congratsLabel.anchor.setTo(0.5, 0.5);
			
			button = new LabelButton(this.game, this.world.centerX, 400, 'btn', 'Menu', _.bind(this.menu, this));
			button.anchor.setTo(0.5, 0);
			button.width = 128;	
			button.height = 48;
			button.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(button);
		}
	},
	menu: function () {
		this.game.state.start('menu');
	},
	next: function () {
		this.game.state.start('play', true, false, this.levelInfo.next);
	}
};
module.exports = GameOver;
