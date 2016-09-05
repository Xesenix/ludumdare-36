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
		// As Kongregate load its api we need to wait for it ready signal to connect to it
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
		// we are waiting for Kongregate ready signal before doing anything
		authenticationPromise = new Promise(function(resolve) { 
			authenticatedDeffer = resolve;
		});
		
		return this.getUser();
	},
	authenticate: function() {
		// specific to kongregate you can open login/registration box on Kongregate website
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
		// not final version as kongregate doesnt have its own way to store user data 
		// we need to use either localstorage or outside serive for example playfab
		return API.getUser()
			.then(function() {
				// TODO: replace with playfab implementation
				return JSON.parse(localStorage.getItem(key));
			});
	},
	setUserData: function(key, value) {
		// not final version as kongregate doesnt have its own way to store user data 
		// we need to use either localstorage or outside serive for example playfab
		return API.getUser()
			.then(function() {
				// TODO: replace with playfab implementation
				localStorage.setItem(key, JSON.stringify(value));
			});
	},
	setScore: function(key, value) {
		// set singular score
		return new Promise(function(resolve) {
			kongregate.stats.submit(key, value);
			resolve();
		});
	},
	setScores: function(values) {
		// set many scores in one call
		return new Promise(function(resolve) {
			_.each(values, function(value, key) {
				kongregate.stats.submit(key, value);
			});
			resolve();
		});
	},
	checkTrophies: function() {
		// this is template method - there is no implementation for kongregate as it has its own way to add achievements
		// but still you can call it from code so it can be easily switched to concrete implementation of service api 
		// wichout need to fixing all spots where this call is needed
	}
};

module.exports = API;