/**
 * main.js
 * Created by: roman.morozov
 * Date: 1/21/13 Time: 4:48 PM
 */

/**
 * Configuring requirejs
 *  paths: path mappings for module names not found directly under baseUrl
 *  shim: Configure the dependencies and exports for older, traditional "browser globals" scripts that do not use define()
 */
require.config({
	shim: {
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
		}
	},

	paths: {
		jquery: 'libs/jquery/jquery-1.8.1',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		templates: '../templates',
		text: 'libs/text'
	}
});

/**
 * Starts main app logic.
 * Loads app.js and runs initialize method
 */
require(['app'], function(App) {
	App.initialize();
});
