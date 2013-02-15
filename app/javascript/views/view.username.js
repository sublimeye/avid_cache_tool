define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {

	return Backbone.View.extend({
		el: '.js-userinfo',

		initialize: function() {
			this.listenTo(app.userModel, 'change:isLogged', this.render);
		},

		render: function() {
			this.$el.text( app.userModel.get('username') );
		}

	});

});
