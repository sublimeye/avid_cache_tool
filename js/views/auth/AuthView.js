define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/auth/authTemplate.html'
], function ($, _, Backbone, authTemplate) {

	var AuthView = Backbone.View.extend({
		el: $(".b-page"),

		render: function () {
			this.$el.html(authTemplate);
		}

	});

	return AuthView;
});
