'use strict';
/* global localStorage */
var Promise = require('promise');

var API = {
	init: function() {
		return this.getUser();
	},
	user: null,
	getUser: function() {
		return new Promise(function(resolve) {
				if (API.user === null || API.user.guest) {
					API.user = {
						username: 'Guest',
						guest: true
					};
				}
				resolve();
			});
	},
	getUserData: function(key) {
		return API.getUser()
			.then(function() {
				// TODO: replace with playfab implementation
				return JSON.parse(localStorage.getItem(key));
			});
	},
	setUserData: function(key, value) {
		return API.getUser()
			.then(function() {
				// TODO: replace with playfab implementation
				localStorage.setItem(key, JSON.stringify(value));
			});
	},
	setScore: function() {
		return new Promise(function(resolve) {
			resolve();
		});
	},
	setScores: function() {
	},
	checkTrophies: function() {
	}
};

module.exports = API;