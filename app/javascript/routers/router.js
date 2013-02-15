// Filename: router.js
define([
	'jquery',
	'underscore',
	'backbone',
	'models/model.user'
], function ($, _, Backbone) {

	return Backbone.Router.extend({
		routes: {
			'*action': 'cacheGroups',
			'cache(/:serverGroup)': 'cacheGroups'
		},

		cacheGroups: function() {

			$.when(
				app.userModel.isUserLogged()
			).then(function() {
				console.log('User is logged in');
				/* User is logged in */
				var user = app.userModel.getUserFromStorage();
					if (user) {
						app.userModel.set(user);
						app.cacheModel.initData( 'isLogged' );
					} else {
						app.authView.promptAuth();
					}
			}).fail(function() {
				/* User is unlogged */
				console.log('User is not logged in. Please login');
				app.authView.promptAuth();
			});

		}

	});

});
