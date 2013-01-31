var app = {
	root: '/'
};

define([
	'jquery',
	'underscore',
	'backbone',
	'routers/router'
], function ($, _, Backbone, Router) {
	var initialize = function () {
		new Router();

		// Trigger the initial route and enable HTML5 History API support, set the
		// root folder to '/' by default.  Change in app.js.
		Backbone.history.start();

	};

	return {
		initialize: initialize
	};
});
