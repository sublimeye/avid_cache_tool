// Filename: router.js
define([
	'jquery',
	'underscore',
	'backbone',
	'views/auth/AuthView'
], function ($, _, Backbone, AuthView) {

	var AppRouter = Backbone.Router.extend({
		routes: {
			// Define some URL routes
			'auth': 'defaultAction',

			// Default
			'*actions': 'defaultAction'
		}
	});

	var initialize = function () {

		var app_router = new AppRouter;

		app_router.on('route:defaultAction', function (actions) {

			// We have no matching route, lets display the home page
			var authView = new AuthView();
			authView.render();

			// unlike the above, we don't call render on this view
			// as it will handle the render call internally after it
			// loads data
//			var footerView = new FooterView();

		});

		Backbone.history.start();
	};
	return {
		initialize: initialize
	};
});
