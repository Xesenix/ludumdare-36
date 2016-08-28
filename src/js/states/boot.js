'use strict';
/* global window, localStorage, Phaser */
var _ = require('lodash');

function Boot() {
}

Boot.prototype = {
	preload: function() {
		console.log('preload boot');
		this.load.image('preloader', 'assets/preloader.gif');
		
		this.game.theme = {
			font: 'VT323'
		};
		
		window.WebFontConfig = {
			active: _.bind(function() {
				console.log('fonts ready 1');
				this.game.time.events.add(Phaser.Timer.SECOND, this.onFontsReady, this);
			}, this),
			google: {
				families: ['VT323']
			}
		};
		this.load.script("webfont", "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js");
	},
	create: function() {
		console.log('boot create');
		this.game.input.maxPointers = 1;
		
		this.game.levels = {
			'tutorial': {
				name: 'Tutorial',
				next: 'level-1',
				story: 'I found some bitten apple on stairs.'
			},
			'level-1': {
				name: 'Level 1',
				next: 'level-2',
				story: 'I wonder where the music comes from?'
			},
			'level-2': {
				name: 'Level 2',
				next: 'level-3',
				story: 'I found some nice looking device but its broken.\n I wonder if i can repair it?'
			},
			'level-3': {
				name: 'Level 3',
				next: 'level-4',
				story: 'I found some notes inside.\nIt says to send it to supplier in case of damage.'
			},
			'level-4': {
				name: 'Level 4',
				next: 'level-5',
				story: 'I found some stone tablet\nwith sign of apple craved into it.\nThats interesting pice of technology.'
			},
			'level-5': {
				name: 'Level 5',
				next: 'level-6',
				story: 'I found something round and some furthere notes\nthey call it wheel,\nancient engineers use to reinvent it a lot.'
			},
			'level-6': {
				name: 'Level 6',
				next: null,
				story: 'What is it its hot its bright lets call it fire.'
			}
		};
		
		var save = JSON.parse(localStorage.getItem('save'));
		
		this.game.progress = _.extend({
			'tutorial': true,
			'level-1': true,
			'level-2': false,
			'level-3': false,
			'level-4': false,
			'level-5': false,
		}, save);
	},
	onFontsReady: function() {
		this.game.state.start('preload');
	}
};

module.exports = Boot;
