'use strict';
/* global Phaser */
var _ = require('lodash');
var LabelButton = require('../components/label_button.js');
var MuteButton = require('../components/mute_button.js');

function Menu() {}

Menu.prototype = {
	preload: function() {
		console.log('preload menu');
	},
	create: function() {
		this.map = this.game.add.tilemap('menu');
		this.map.addTilesetImage('tiles', 'tiles');
		this.mapTiles = this.map.createLayer('Layout');
		
		this.game.world.setBounds(-16, 0, 800, 600);
		
		var time = 400;
		this.hero = this.game.add.sprite(6 * 64, 0 * 64, 'hero');
		this.hero.alpha = 0;
		this.heroTween = this.game.add.tween(this.hero).to({ x: 6 * 64, y: 4 * 64, alpha: 1 }, 200, Phaser.Easing.Linear.NONE, false, 200, 0, false);
		this.heroTween.chain(
			this.heroTween.to({ x: 4 * 64, y: 4 * 64 }, time * 2, Phaser.Easing.Linear.NONE, false, 200, 0, false),
			this.heroTween.to({ x: 4 * 64, y: 7 * 64 }, time * 3, Phaser.Easing.Linear.NONE, false, 200, 0, false),
			this.heroTween.to({ x: 5 * 64, y: 7 * 64 }, time * 1, Phaser.Easing.Linear.NONE, false, 200, 0, false),
			this.heroTween.to({ alpha: 0 }, 100, Phaser.Easing.Linear.NONE, false, 200, 0, false),
			this.heroTween.to({ x: 6 * 64, y: 0 * 64 }, 100, Phaser.Easing.Linear.NONE, false, 200, 0, false)
		);
		
		//this.heroTween.repeat(5, 1500);
		
		this.menuItemIndex = 0;
		
		_.each(this.game.levels, _.bind(function(level, key) {
			var btn= this.createMenuButton(level.name, _.bind(function() { 
				if (this.game.progress[key]) {
					this.game.state.start('play', true, false, key);
				}
			}, this));
			btn.tint = this.game.progress[key] ? 0x80ffaa : 0xaaaaaa;
		}, this));
		
		this.titleLabel = this.game.add.text(128, 192, 'Ancient Maze\nof Epla\nLudumdare 36', { font: '64px ' + this.game.theme.font, fill: '#ffffff', align: 'left'});
		this.titleLabel.anchor.setTo(0, 0);
		this.titleLabel.setShadow(5, 5, 'rgba(0,0,0,0.5)', 0);
		
		this.titleLabelTween = this.game.add.tween(this.titleLabel).from({ y: this.titleLabel.y - 124, alpha: 0 }, 1000, Phaser.Easing.Linear.NONE, true, 200, 0, false).chain(this.heroTween);
		
		this.muteButton = new MuteButton(this.game, 24, 24, 'mute');
		this.muteButton.anchor.setTo(0.5, 0.5);
		this.muteButton.width = 32;
		this.muteButton.height = 32;
		
		this.world.add(this.muteButton);
		
		if (this.game.service !== null && this.game.service.user !== null && !this.game.service.user.guest) {
			this.loginLabel = this.game.add.text(10, this.game.world.height - 10, 'Logged in as: ' + this.game.service.user.username, { font: '16px ' + this.game.theme.font, fill: '#ffffff', align: 'left'});
			this.loginLabel.anchor.setTo(0, 1);
		} else {
			this.loginLabel = this.game.add.text(10, this.game.world.height - 10, 'Not logged in', { font: '16px ' + this.game.theme.font, fill: '#ffffff', align: 'left'});
			this.loginLabel.anchor.setTo(0, 1);
		}
	},
	createMenuButton: function(label, callback) {
		var button = new LabelButton(this.game, this.world.width - 100, 68 + 64 * (this.menuItemIndex++), 'btn', label, callback, this, this);
		button.anchor.setTo(1, 0);
		button.width = 184;	
		button.height = 56;
		button.label.setStyle({ font: '20px ' + this.game.theme.font, fill: '#000000', align: 'center' }, true);
		//button.fixedToCamera = true;
		
		this.game.world.add(button);
		
		return button;
	},
	shutdown: function() {
		// console.log('shutdown');
		if (this.heroTween) {
			this.heroTween.onComplete.removeAll();
			this.heroTween.stop();
			this.heroTween = null;
		}
		
		if (this.titleLabelTween) {
			this.titleLabelTween.onComplete.removeAll();
			this.titleLabelTween.stop();
			this.titleLabelTween = null;
		}
		
		this.hero.kill();
		this.hero = null;

		this.titleLabel.kill();
		this.titleLabel = null;
		
		this.loginLabel.kill();
		this.loginLabel = null;
	}
};

module.exports = Menu;
