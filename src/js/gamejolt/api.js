'use strict';
/* global window, XMLHttpRequest */
var Promise = require('promise');
var url = require('url');
var md5 = require('js-md5');
var bind = require('lodash/bind');
var each = require('lodash/each');
var merge = require('lodash/merge');
var FalbackAPI = require('../generic/api.js');

/* settings are declared outside of repo as they containg sensitive data
specific to your gamejolt api setup example.:
{
	gameId: #GAME_ID#,
	privateKey: #PRIVATE_KEY,
	scoresTables: {
		'Level1Steps': {
			tableId: #SCORE_TABLE_ID,
			label: function(value) { return #YOUR_SCORE_LABEL# }
		},
		...
	},
	checkTrophies: function(api, data) {
		#YOUR_TROPHIES CONDITIONS#
	}
}
*/
var settings = require('./settings.js');

var API = {
	init: function() {
		return this.getUser();
	},
	authenticate: function(username, token) {
		API.user = {
			username: username || '',
			token: token || '',
			guest: true
		};
		return API.sendRequest('http://gamejolt.com/api/game/v1/users/auth/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&format=json')
			.then(function(result) {
				console.log('authenticated ', result);
				if (result.response.success === "true") {
					API.user.guest = false;
				}
				return API.user;
			})
			.catch(function() {
				console.log('not authenticated ');
				API.user = null;
				return API.user;
			});
	},
	user: null,
	sendRequest: function(uri) {
		// helper method for building and sending ajax requests to Gamejolt API 
		return new Promise(function(resolve, reject) {
			var signature = md5(uri + settings.privateKey);
			uri += '&signature=' + signature;
			
			var request = new XMLHttpRequest();
			request.open('GET', uri, true);
			request.onload = function() {
				if (request.status >= 200 && request.status < 400) {
					var data = JSON.parse(request.responseText);
					resolve(data);
				} else {
					reject();
				}
			};
			request.send();
		});
	},
	getUser: function() {
		// we need to check user credentials via ajax
		return new Promise(function(resolve, reject) {
			if (API.user === null) {
				var urlParts = url.parse(window.location.href, true);
				var params = urlParts.query;

				API.user = {
					username: params.gjapi_username || '',
					token: params.gjapi_token || '',
					guest: typeof(params.gjapi_username) === 'undefined' || typeof(params.gjapi_token) === 'undefined'
				};
			
				return API.sendRequest('http://gamejolt.com/api/game/v1/users/auth/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&format=json')
					.then(function() {
						resolve(API.user);
					})
					.catch(function() {
						API.user = null;
						reject();
					});
			} else {
				resolve(API.user);
			}
		});
	},
	setData: function(key, data) {
		// game data is stored on Gamejolt web so we need to send ajax request
		var uri = 'http://gamejolt.com/api/game/v1/data-store/set/?game_id=' + settings.gameId + '&key=' + key + '&data=' + JSON.stringify(data) + '&format=json';

		return API.sendRequest(uri);
	},
	getData: function(key, defaultValue) {
		// game data is stored on Gamejolt web so we need to send ajax request
		var uri = 'http://gamejolt.com/api/game/v1/data-store/?game_id=' + settings.gameId + '&key=' + key + '&format=json';

		return API.sendRequest(uri)
			.then(function(result) {
				return result || defaultValue;
			});
	},
	setUserData: function(key, data) {
		// user data is stored on Gamejolt web so we need to send ajax request
		return API.getUser()
			.then(function() {
				if (API.user.guest) {
					return FalbackAPI.setUserData(key, data);
				} else {
					var uri = 'http://gamejolt.com/api/game/v1/data-store/set/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&key=' + key + '&data=' + JSON.stringify(data) + '&format=json';

					return API.sendRequest(uri);
				}
			}, function() {
				console.log('getUser error');
			});
	},
	getUserData: function(key, defaultValue) {
		// user data is stored on Gamejolt web so we need to send ajax request
		return API.getUser()
			.then(function() {
				if (API.user.guest) {
					return FalbackAPI.getUserData(key);
				} else {
					var uri = 'http://gamejolt.com/api/game/v1/data-store/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&key=' + key + '&format=json';

					return API.sendRequest(uri)
						.then(function(result) {
							return FalbackAPI.getUserData(key).then(function(backupData) {
								return merge(backupData, JSON.parse(result.response.data)) || defaultValue;
							});
						});
				}
			});
	},
	addTrophy: function(trophyId) {
		// trophies are set on Gamejolt web so we need to send ajax request
		return API.getUser()
			.then(function() {
				var uri = 'http://gamejolt.com/api/game/v1/trophies/add-achieved/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&trophy_id=' + trophyId + '&format=json';
			
				return API.sendRequest(uri);
			});
	},
	getTrophies: function() {
		// TODO: implement 
	},
	setScore: function(score, value) {
		// scores are set on Gamejolt web so we need to send ajax request
		return API.getUser()
			.then(function() {
				var uri = 'http://gamejolt.com/api/game/v1/scores/add/?game_id=' + settings.gameId + '&username=' + API.user.username + '&user_token=' + API.user.token + '&sort=' + value + '&format=json';
				
				if (typeof settings.scoresTables[score] !== 'undefined') {
					var scoreSetting = settings.scoresTables[score];
					uri += '&score=' + scoreSetting.label(value);
					uri += '&table_id=' + scoreSetting.tableId;
					
					return API.sendRequest(uri);
				}
			});
	},
	setScores: function(values) {
		return new Promise(bind(function(resolve) {
			each(values, bind(function(value, key) {
				this.setScore(key, value);
			}, this));
			resolve();
		}, this));
	},
	getScore: function() {
		// TODO: implement 
	},
	checkTrophies: function(data) {
		// we use settings to pass logic for awarding trophies (settings are declared outside of repo as they containg sensitive data)
		if (typeof settings.checkTrophies === 'function' && API.user.guest !== true) {
			settings.checkTrophies(this, data);
		}
	}
};

module.exports = API;