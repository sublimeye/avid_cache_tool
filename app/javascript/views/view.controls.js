define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/cache_controls.html'
], function ($, _, Backbone, controlsTmpl) {

	return Backbone.View.extend({
		el : '.b-app-controls',

		events: {
			'click .js-refresh-cache': 'refreshCacheGroups',
			'click .js-clear-selection': 'clearSelection',
			'click .js-flush-localstorage': 'resetLoading'
		},

		elements: {},

		initialize: function() {
			this.render();
			this.listenTo( app.cacheView, 'updateLog', this.updateLog );
		},

		render: function () {
			var tabsSwitcherHTML = _.template( controlsTmpl );
			this.$el.html(tabsSwitcherHTML);
			this.elements['log'] = this.$el.find('.d-log');
		},

		updateLog: function( text ) {
			var log = this.elements.log;

			log.append(text + '<br/>');
			log[0].scrollTop = log[0].scrollHeight
		},

		refreshCacheGroups: function() {
			app.cacheView.refreshCacheGroups();
		},

		clearSelection: function() {
			app.cacheView.clearSelection();
		},

		resetLoading: function() {
			app.cacheView.resetLoading();
		}

	});

});
