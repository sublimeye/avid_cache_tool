define([
	'underscore',
	'backbone'
], function (_, Backbone) {

	return Backbone.Model.extend({
		defaults: {
			username: '',
			isLogged: false,
			saveUser: true
		},

		login: function( credentials ) {
			var user = {
				username: credentials.UserName,
				isLogged: true
			};

//			var saveUser = this.get('saveUser');
/*
			if (saveUser) {
				user['Password'] = credentials.Password;
			}
*/

			this.set(user);
			localStorage.setObject('user', user);
		},

		getUserFromStorage: function() {
			var user = localStorage.getObject('user');
			return user;
		},

		isUserLogged: function() {
			var dfd = $.Deferred();

			$.when(
				app.api.get.config()
			).then(function() {
				dfd.resolve();
			}).fail(function() {
				dfd.reject()
			});

			return dfd.promise();
		}
	});

});
