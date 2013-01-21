/**
 * main.js
 * Created by: roman.morozov
 * Date: 1/21/13 Time: 4:48 PM
 */

require.config({
	paths: {
		jquery: 'libs/jquery/jquery-1.8.1',
		underscore: 'libs/underscore/underscore-amd',
		backbone: 'libs/backbone/backbone-amd',
		templates: '../templates'
	}
});

require(['app'], function(App) {
	App.initialize();
});
