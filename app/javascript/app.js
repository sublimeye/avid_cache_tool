define([
	'jquery',
	'underscore',
	'backbone',
	'routers/router',
	'server',
	'models/model.user',
	'models/model.cache',
	'views/view.auth',
	'views/view.cache',
	'views/view.username'
], function ($, _, Backbone, Router, Server, userModel, cacheModel, authView, cacheView, usernameView) {
	var initialize = function () {
		app.api = Server.API;

		app.userModel = new userModel();
		app.cacheModel = new cacheModel();

		app.authView = new authView();
		app.cacheView = new cacheView();
		app.usernameView = new usernameView();

		app.router = new Router();

		Backbone.history.start();

//		localStorage.clear();
		localStorage.setObject('cache', null);
	};

	return {
		initialize: initialize
	};
});
