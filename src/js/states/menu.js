'use strict';
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
		
		this.menuItemIndex = 0;
		
		_.each(this.game.levels, _.bind(function(level, key) {
			var btn= this.createMenuButton(level.name, _.bind(function() { 
				if (this.game.progress[key]) {
					this.game.state.start('play', true, false, key);
				}
			}, this));
			btn.tint = this.game.progress[key] ? 0x80ffaa : 0xaaaaaa;
		}, this));
		
		this.muteButton = new MuteButton(this.game, 24, 24, 'mute');
		this.muteButton.anchor.setTo(0.5, 0.5);
		this.muteButton.width = 32;
		this.muteButton.height = 32;
		
		this.world.add(this.muteButton);
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
	}
};

module.exports = Menu;
