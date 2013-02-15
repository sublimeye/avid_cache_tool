/**
 * main.js
 * Created by: roman.morozov
 * Date: 1/21/13 Time: 4:48 PM
 */
var app = {};

/**
 * Configuring requirejs
 *  paths: path mappings for module names not found directly under baseUrl
 *  shim: Configure the dependencies and exports for older, traditional "browser globals" scripts that do not use define()
 */
require.config({
	paths: {
		jquery: 'libs/jquery/jquery-1.8.1',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		modernizr: 'libs/moernizr-min',
		templates: '../templates',
		server: 'modules/server',
		text: 'libs/text'
	},

	shim: {
		'libs/jquery/jquery-serialize-json': ['jquery'],
		'libs/jquery/jquery-tmpl': ['jquery'],
		'app': ['jquery', 'backbone', 'underscore'],
		'libs/backbone/backbone.routefilter': ['backbone'],

		underscore: {
			exports: '_'
		},

		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},

		backboneLocalstorage: {
			deps: ['backbone'],
			exports: 'Store'
		},

		modernizr: {
			exports: 'modern'
		}
	}

});

/**
 * Starts main app logic.
 * Loads app.js and runs initialize method
 */
require([
		'app',
		'modules/storage',
		'libs/backbone/backbone.routefilter',
		'libs/jquery/jquery-serialize-json',
		'libs/jquery/jquery-tmpl'
		], function(App) {
	console.log('initializing');
	App.initialize();
});
