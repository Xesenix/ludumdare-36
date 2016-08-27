'use strict';
/* global window*/

function Boot() {
}

Boot.prototype = {
	preload: function() {
		this.load.image('preloader', 'assets/preloader.gif');
	},
	create: function() {
		this.game.input.maxPointers = 1;
		this.game.state.start('preload');
		
		this.game.theme = {
			font: 'Exo'
		};
		
		window.WebFontConfig = {
			google: {
				families: ['Exo::latin-ext']
			}
		};
	}
};

module.exports = Boot;
