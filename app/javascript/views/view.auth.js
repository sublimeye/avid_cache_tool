define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/auth_template.html',
	'server'
], function ($, _, Backbone) {

	return Backbone.View.extend({
		el: '.b-modal',

		events: {
			'submit .js-auth-form': 'authenticate',
			'keyup .js-auth-form input': 'hideErrorMessage'
		},

		promptAuth: function() {
			this.$el.addClass('is-visible');
		},

		hidePrompt: function() {
			this.$el.removeClass('is-visible');
		},

		showErrorMessage: function() {
			this.$el.addClass('is-error');
		},

		hideErrorMessage: function() {
			this.$el.removeClass('is-error');
		},

		authenticate: function(e) {
			var _this = this;
			var credentials = $('.js-auth-form').serializeObject();

			$.when(
				app.api.post.auth( credentials )
			).then(function() {
				_this.hidePrompt();
				app.userModel.login( credentials );
				/*
				* When cache model initiates cacheView will render
				* */
				app.cacheModel.initData();
			}).fail(function() {
				_this.showErrorMessage();
			});

			e.preventDefault();
			return false;
		}

	});

});
