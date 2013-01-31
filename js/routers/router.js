// Filename: router.js
define([
	'jquery',
	'underscore',
	'backbone',
	'../views/auth/AuthView'
], function ($, _, Backbone, AuthView) {

	var Router = Backbone.Router.extend({
		routes: {
			'auth': 'authScreen',
			'cache(/:serverGroup)': 'showServerGroup',

			'*action': 'guideUser'
		},

		guideUser: function() {
			console.log('guideUser - default action');
			var loggedIn = false;

			if (!loggedIn) {
				this.navigate( '//auth', { trigger: true} );
			} else {
				this.showDefaultCacheGroup();
			}
		},

		authScreen: function() {
			console.log('auth');
			var authView = new AuthView();
			authView.render();
		},

		/**
		 * Show specific servers cache group data (preview, live, other ...)
		 * @param group
		 */
		showServerGroup: function( group ) {
			console.log('cache group ', group);
			this.showDefaultCacheGroup();
		},

		/**
		 * Get first/default cache group from the configuration and show its data
		 */
		showDefaultCacheGroup: function() {
			var defaultCacheGroup = 'preview';
			this.navigate( '//cache/' + defaultCacheGroup );
		}
	});

	return Router
});
