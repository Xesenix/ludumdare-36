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
		
		this.game.service.setScore('LevelReached', this.levelInfo.index);
		this.game.service.setScore('Level' + this.levelInfo.index + 'Steps', this.result.numberOfSteps);
		
		this.game.service.checkTrophies({
			level: this.levelInfo.index,
			steps: this.result.numberOfSteps
		});
		
		if (this.levelInfo.next === null) {
			this.game.service.setScore('GameCompleted', 1);
		}
	},
	preload: function () {
	
	},
	create: function () {
		this.game.input.keyboard.onDownCallback = _.bind(this.next, this);

		this.storyLabel = this.game.add.text(this.game.world.centerX, 300, this.levelInfo.story, { font: '24px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
		this.storyLabel.anchor.setTo(0.5, 0.5);
		
		if (this.levelInfo.next !== null) {
			this.titleLabel = this.game.add.text(this.game.world.centerX, 100, 'Level finished!\nnumber of steps:' + this.result.numberOfSteps, { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.titleLabel.anchor.setTo(0.5, 0.5);

			this.congratsLabel = this.game.add.text(this.game.world.centerX, 200, 'Next level unlocked!', { font: '32px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.congratsLabel.anchor.setTo(0.5, 0.5);
			
			this.nextButton = new LabelButton(this.game, this.world.centerX - 10, 400, 'btn', 'Next', _.bind(this.next, this));
			this.nextButton.anchor.setTo(1, 0);
			this.nextButton.width = 128;	
			this.nextButton.height = 48;
			this.nextButton.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(this.nextButton);
			
			this.menuButton = new LabelButton(this.game, this.world.centerX + 10, 400, 'btn', 'Menu', _.bind(this.menu, this));
			this.menuButton.anchor.setTo(0, 0);
			this.menuButton.width = 128;	
			this.menuButton.height = 48;
			this.menuButton.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(this.menuButton);
		} else {		
			this.titleLabel = this.game.add.text(this.game.world.centerX,100, 'Victory!\nnumber of steps:' + this.result.numberOfSteps, { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.titleLabel.anchor.setTo(0.5, 0.5);

			this.congratsLabel = this.game.add.text(this.game.world.centerX, 200, 'Thank you for playing!', { font: '32px ' + this.game.theme.font, fill: '#ffffff', align: 'center'});
			this.congratsLabel.anchor.setTo(0.5, 0.5);
			
			this.menuButton = new LabelButton(this.game, this.world.centerX, 400, 'btn', 'Menu', _.bind(this.menu, this));
			this.menuButton.anchor.setTo(0.5, 0);
			this.menuButton.width = 128;	
			this.menuButton.height = 48;
			this.menuButton.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);

			this.game.world.add(this.menuButton);
		}
	},
	menu: function () {
		this.game.state.start('menu');
	},
	next: function () {
		this.game.state.start('play', true, false, this.levelInfo.next);
	},
	shutdown: function() {
		this.game.input.keyboard.onDownCallback = null;
		this.game.input.keyboard.onUpCallback = null;
		
		this.titleLabel.kill();
		this.titleLabel = null;
		
		this.congratsLabel.kill();
		this.congratsLabel = null;
		
		this.menuButton.kill();
		this.menuButton = null;
		
		this.storyLabel.kill();
		this.storyLabel = null;
	}
};
module.exports = GameOver;
