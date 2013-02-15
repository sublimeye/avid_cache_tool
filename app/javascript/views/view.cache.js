define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/cache_groups.html',
	'views/view.controls'
], function ($, _, Backbone, tabsSwitcherTmpl, ControlsView) {

	return Backbone.View.extend({
		el : '.b-app-content',

		events: {
			'click .b-cache-tab': 'switchTab',
			'mousedown .d-item': 'selectItem',
			'click .d-cache-group': 'selectGroup',
			'mouseenter .d-cache-group': 'highlightGroup',
			'mouseleave .d-cache-group': 'deHighlightGroup'
		},

		labels: {
			'triggered': 'clicked',
			'inProgress': 'd-item-inprogress',
			'processing': 'd-item-processing',
			'selected': 'd-item-selected',
			'refreshed': 'd-item-refreshed'
		},

		tabs: {}, // cached tab elements {$} will be stored here
		items: null,

		initialize: function() {
 			this.listenTo( app.cacheModel, 'change:cache', this.render );
		},

		render: function () {
			var cacheModel = app.cacheModel.get('unite'),
				items;

			console.log('cacheModel', cacheModel);

			/* generate tabs switcher HTML structure using tabsSwitcher template & cache.model */
			var tabsSwitcherHTML = _.template( tabsSwitcherTmpl )( cacheModel );

			/* render cache groups */
			this.$el.html(tabsSwitcherHTML);

			items = this.$el.find('.d-item');
			app.cacheModel.set('items', items);

			/* find tabs and store in cacheView's precached tabs:object */
			this.initTabsControls();

			/* Init controls */
			app.controlsView = new  ControlsView();
		},

		/**
		 * Find and cache tab elements. Save in cacheView.items
		 */
		initTabsControls: function() {
			var _this = this;

			this.$el.find('.b-cache-tab-content[data-tabswitch]').each(function() {
				var idx = $(this).attr('data-tabswitch');
				_this.tabs[idx] = $(this);
			});
		},

		/**
		 * Tab switch action.
		 * Switch content and clear selection on tabChange
		 * @param tab
		 */
		switchTab: function( tab ) {
			var idx = $(tab.currentTarget).attr('data-tabindex');
			_.each(this.tabs, function(element) {
				element.hide();
			});

			this.clearSelection();
			this.tabs[idx].show();
		},

		/**
		 * Toggle selection on clicked item
		 * @param e
		 */
		selectItem: function(e) {
			this.toggleItemSelection( $(e.currentTarget) );
		},

		/**
		 * Filter all items that is not inProgress and toggle selection
		 * @param items
		 */
		toggleItemSelection: function (items) {
			items = items.not('.' + this.labels.inProgress);
			items.toggleClass(this.labels.selected);
		},

		/**
		 * Toggles whole cachegroup row. (All locales)
		 * @param e
		 */
		selectGroup: function(e) {
			var items = $(e.currentTarget).siblings('td').find('.d-item');
			this.toggleItemSelection(items);
		},

		/**
		 * Add highlighting class to the cachegroup
		 * @param e
		 */
		highlightGroup: function(e) {
			$(e.currentTarget).parent().addClass('hover');
		},

		/**
		 * Removes highlighting class from the cachegroup
		 * @param e
		 */
		deHighlightGroup: function(e) {
			$(e.currentTarget).parent().removeClass('hover');
		},

		/**
		 * Remove selection from all items
		 */
		clearSelection: function() {
			var items = app.cacheModel.get('items');
			items.removeClass( this.labels.selected );
		},

		/**
		 * Find all selected items and call items refresh
		 * Mark these cache groups as processing
		 */
		refreshCacheGroups: function() {
			var selected = this.$el.find( '.' + this.labels.selected );

			this.refreshSelectedItems(selected);
			this.markProcessing(selected);
		},

		resetLoading: function() {
			var items = app.cacheModel.get('items');
			var labels = this.labels;

			localStorage.deleteObject('pending');

			items.removeClass(labels.selected);
			items.removeClass(labels.inProgress);
			items.removeClass(labels.refreshed);
		},

		/**
		 *
		 * @param items
		 * @return {Boolean}
		 */
		refreshSelectedItems: function(items) {
			var _this = this;

			if (!items.length) {
				this.trigger('updateLog', 'No selected items');
				return false;
			}

			$.each(items, function (i, item) {
				_this.requestRefresh(item);
			});

			return true;
		},

		/**
		 * Highlight items as processing (removes selected class)
		 * @param items {$}
		 */
		markProcessing:function(items) {
			items.removeClass(this.labels.selected);
			items.addClass(this.labels.processing);
		},

		/**
		 * Remove processing class
		 * @param item {Element}
		 */
		unmarkProcessing: function(item) {
			$(item).removeClass(this.labels.processing);
		},

		/**
		 * Highlight items with inProgress class
		 * @param item
		 */
		markInProgress: function(item) {
			$(item).addClass(this.labels.inProgress);
		},

		/**
		 * Send cache/update request with URL/group that should be updated
		 * @param item
		 */
		requestRefresh: function(item) {
			var _this = this;
			var url = this.getItemUrl(item);

			$.when(
				app.api.post.update( { 'group': url } )
			).then(function() {
				/*remove preloader*/
				_this.unmarkProcessing(item);
				/*mark "inprogress" color, red*/
				_this.markInProgress(item);
				/*add onscreen log data*/
				_this.add2Log(item, url);
				/* store item time to storage */
				_this.setPendingItem(item, url);
			}).fail(function() {
				console.log('Something goes wrong :(');
			});
		},

		getItemUrl: function(item) {
			return item.getAttribute('data-url');
		},

		/**
		 * Formats URL as a string: [Locale][CacheSection][cacheGroup]
		 * Add that string to Logger
		 * @param item
		 * @param url
		 */
		add2Log: function(item, url) {
			var result = url.replace(/http:\/\/.+?\/(.+?)\/(.+?)\/.+?\/(.*)/g, "[$2] [$1] [$3]");
			this.trigger('updateLog', result);

		},

		setPendingItem: function(item, url) {
			var timestamp = this.getLastUpdateTime( item );
			var pending = localStorage.getObject('pending') || {};

			pending[url] = timestamp;
			localStorage.setObject('pending', pending);
		},

		getLastUpdateTime: function(item) {
			return $(item).attr('data-last-updated');
		}


	});

});
