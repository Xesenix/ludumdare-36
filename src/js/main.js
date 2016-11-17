/* global Phaser */

(function () {
	var BootState = require('./states/boot.js');
	var GameoverState = require('./states/gameover.js');
	var IntroState = require('./states/intro.js');
	var MenuState = require('./states/menu.js');
	var PlayState = require('./states/play.js');
	var PreloadState = require('./states/preload.js');
	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
	
	// setup service on which game should work (kongregate/gamejolt or generic)
	var ServiceApi = require('./gamejolt/api.js');

	game.service = ServiceApi;
	
	// website page apis should manage user data
	game.dataStorage = ServiceApi;
	
	game.service.init();
	
	game.state.add('boot', BootState);
	game.state.add('gameover', GameoverState);
	game.state.add('intro', IntroState);
	game.state.add('menu', MenuState);
	game.state.add('play', PlayState);
	game.state.add('preload', PreloadState);
	
	game.state.start('boot');
	
	console.log("Game started");
})();