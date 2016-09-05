'use strict';
/* global localStorage */
var Promise = require('promise');

var API = {
	init: function() {
		return this.getUser();
	},
	user: null,
	getUser: function() {
		// do not expect result other than Guest
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
		// in generic service we can just use localStorage as it should be available everywhere - although not particulary save as players can edit it in console
		return API.getUser()
			.then(function() {
				return JSON.parse(localStorage.getItem(key));
			});
	},
	setUserData: function(key, value) {
		// in generic service we can just use localStorage as it should be available everywhere - although not particulary save as players can edit it in console
		return API.getUser()
			.then(function() {
				localStorage.setItem(key, JSON.stringify(value));
			});
	},
	setScore: function() {
		// this is template method - there is no implementation when you are not using any specific webservice
		// but still you can call it from code so it can be easily switched to concrete implementation of service api 
		// wichout need to fixing all spots where this call is needed
		return new Promise(function(resolve) {
			resolve();
		});
	},
	setScores: function() {
		// this is template method - there is no implementation when you are not using any specific webservice
		// but still you can call it from code so it can be easily switched to concrete implementation of service api 
		// wichout need to fixing all spots where this call is needed
		return new Promise(function(resolve) {
			resolve();
		});
	},
	checkTrophies: function() {
		// this is template method - there is no implementation when you are not using any specific webservice
		// but still you can call it from code so it can be easily switched to concrete implementation of service api 
		// wichout need to fixing all spots where this call is needed
		return new Promise(function(resolve) {
			resolve();
		});
	}
};

module.exports = API;