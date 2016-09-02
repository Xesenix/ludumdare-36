'use strict';
/* global localStorage, kongregateAPI */
var _ = require('lodash');
var Promise = require('promise');
var kongregate = null;
var authenticatedDeffer = null;
var authenticationPromise = null;
var API = null;

var InitApi = new Promise(function(resolve) {
	if (kongregate === null) {
		kongregateAPI.loadAPI(function () {
			kongregate = kongregateAPI.getAPI();
			kongregate.services.addEventListener('login', function() {
				API.getUser().then(authenticatedDeffer);
			});
			
			resolve();
		});
	} else {
		resolve();
	}
});

API = {
	init: function() {
		authenticationPromise = new Promise(function(resolve) { 
			authenticatedDeffer = resolve;
		});
		return this.getUser();
	},
	authenticate: function() {
		kongregate.services.showRegistrationBox();
		return authenticationPromise;
	},
	user: null,
	getUser: function() {
		return InitApi
			.then(function() {
				if (API.user === null || API.user.guest) {
					API.user = {
						userId: kongregate.services.getUserId(),
						username: kongregate.services.getUsername(),
						token: kongregate.services.getGameAuthToken(),
						guest: kongregate.services.isGuest()
					};
				}
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
	setScore: function(key, value) {
		return new Promise(function(resolve) {
			kongregate.stats.submit(key, value);
			resolve();
		});
	},
	setScores: function(values) {
		return new Promise(function(resolve) {
			_.each(values, function(value, key) {
				kongregate.stats.submit(key, value);
			});
			resolve();
		});
	},
	checkTrophies: function() {
		
	}
};

module.exports = API;