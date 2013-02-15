define([
	'underscore',
	'backbone'
], function (_, Backbone) {

	return Backbone.Model.extend({
		defaults: {
			local: false,
			data: null,
			cache: null,
			config: null,
			localeOrder: ['BR', 'CN', 'DE', 'ES', 'FR', 'JP', 'KR', 'LA', 'US'],
			sectionsPriority: ['Products', 'SiteCommon', 'Generics', 'CorporatePages', 'HomePage', 'VanityUrls'],
			cacheGroupsPriority: {
				'Products': ['PRODUCTS_LIST', 'PRODUCT_FAMILY', 'PRODUCT_CHAMPIONS', 'PRODUCTS_HOME', 'PRODUCT_CATEGORY_HOME'],
				'SiteCommon': ['COMMON_CONTENT', 'COMMON_SHARED_CONTENT', 'SITE_HEADER_MENU', 'SITE_FOOTER_MENU'],
				'Generics': ['GENERIC_LEVEL_CONTENT']
			},
			items: null
		},

		setDataToStorage: function (unite, cache, config) {
			localStorage.setObject('unite', unite);
			localStorage.setObject('cache', cache);
			localStorage.setObject('config', config);
		},

		getDataFromStorage: function () {
			var data = {};

			data['cache'] = localStorage.getObject('cache');
			data['config'] = localStorage.getObject('config');
			data['unite'] = localStorage.getObject('unite');

			if (data.cache && data.config && data.unite) {
				return data;
			}

			return false;
		},

		updateModelData: function (unite, cache, config) {
			this.set({ 'unite': unite, 'cache': cache, 'config': config, 'local': true });
		},

		/**
		 * If user is logged in ( checking cookie ) and there is a cacheData
		 * in localStorage get this data from local storage and update the model
		 * Else loads this data from the server
		 * @param isLogged
		 * @return {*}
		 */
		initData: function ( isLogged ) {
			var dfd = $.Deferred();
			var _this = this;
			var localData = this.getDataFromStorage();
			if (isLogged && localData) {
				console.log('Requesting data from the Local Storage');
				this.updateModelData(localData.unite, localData.cache, localData.config);
				dfd.resolve();
			} else {
				console.log('Requesting data from the server');
				$.when(
					app.api.get.cache(),
					app.api.get.config()
				).then(function (cacheResponse, configResponse) {
						var cache = cacheResponse[0].data;
						var config = configResponse[0].data;
						var unite = _this.uniteData(config, cache);

						_this.setDataToStorage(unite, cache, config);
						_this.updateModelData(unite, cache, config);

						dfd.resolve(unite);
					}).fail(function () {
						dfd.reject({'error': 'Cant load config and cache. Please try again.'});
					});
			}

			return dfd.promise();
		},

		/**
		 * Performs initial cacheData object transformation to appropriate format
		 *
		 * From:
		 * CacheData -> ArrayOfObjects -> Locales/->Items with Subsections
		 * To:
		 * CacheData -> Section -> Subsection -> Locales [...]
		 *
		 * @param config {Array}
		 * @param cache {Array}
		 * @return {*}
		 */
		uniteData: function(config, cache) {
			var _this = this;
			var defaults = {
				localeOrder: this.get('localeOrder'),
				sectionsPriority: this.get('sectionsPriority'),
				cacheGroupsPriority: this.get('cacheGroupsPriority')
			};
			var unite = $.extend(true, {}, {'data': config, 'options': defaults});
			var pending = localStorage.getObject('pending');

			/* loop through config array */
			_.each(unite.data, function( group ) {

				/* Every server in servers array => extracting cache data from the deep structure */
				_.each( group.servers, function( server ) {
					server['cacheData'] = _this.getCacheGroupByUrl( server.url, cache );
				})
			});

			/**
			 * TODO: Remove this when server side will be changed
			 * Temporary serverTime extraction from the cache data;
			 * This should be fixed on the server side and time should be taken from it
			 */

			var serverTime = cache[0].serverTime;
			/**
			 * END
			 */

			/* main loop */
			/*  */
			_.each(unite.data, function( serverGroup ) {

				_.each( serverGroup.servers, function( server ) {
					/* empty object that will be filled in using correct structure */
					var newData = {};

					/* Combine by cache group name, i.e. Corporate Pages, AvidTV */
					server.cacheData = _.groupBy(server.cacheData, function( cacheGroups ) {
						return cacheGroups.name
					});

					/* loop over cache sections, i.e. Corporate Pages, AvidTV, Search */
					_.each(server.cacheData, function( section, sectionKey ) {
						newData[sectionKey] = {};

						/* Loop over every "locale" object with "items" array */
						_.each( section, function( sectionLocale ) {
							var locale = sectionLocale.locale;

							/* Items Array -> Contains subsection Objects */
							sectionLocale.items.forEach(function(item) {
								var subsectionKey = item.name;  // GENERIC_TAXONOMY {string}
								var newDataSubsection = newData[sectionKey][subsectionKey] || {};   // Corporate -> GENERIC_TAXONOMY {Object ref}
								var pendingKey = pending && pending[server.url + item.url];

								item['elapsed'] = _this.getElapsedTime(item.lastUpdate, serverTime);

								if (pendingKey) {
									item['pendingStatus'] = _this.checkPendingStatus(item.lastUpdate, pendingKey);
								}

								newDataSubsection[locale] = item; // GENERIC_TAXONOMY[_Locale_] = GENERIC_TAXONOMY CONTENT {Object ref}

								newData[sectionKey][subsectionKey] = newDataSubsection;
							});
						});

					});

					/* rewrite existing cacheData with reformatted and ready for rendering cacheData */
					server.cacheData = newData;
				});

			});

			return unite;

		},

		/**
		 * Get difference between server time and last updated time of the item
		 * @param ms {String} When item was last updated - milliseconds
		 * @param serverTime {String} Server's local time - milliseconds
		 * @return {String} Elapsed time - Formatted string HH:MM:SS
		 */
		getElapsedTime: function(ms, serverTime) {
			var diff = serverTime - ms;
			return this.formatMilliseconds(diff);
		},

		/**
		 * Convert milliseconds to readable time HOURS:MIN:SEC (hours may be more than 24)
		 *
		 * @param ms {String} Milliseconds
		 * @return {String} Hours : Mins : Secs
		 */
		formatMilliseconds: function (ms) {
			var hours = Math.floor(ms / 36e5),
				mins = Math.floor((ms % 36e5) / 6e4),
				secs = Math.floor((ms % 6e4) / 1000);
			return '' + hours + ':' + mins + ':' + secs;
		},

		getCacheGroupByUrl: function(url, cache) {
			var united = _.find(cache, function(item) {
				return item.url === url;
			});

			return $.extend({}, united.cacheGroups);
		},

		checkPendingStatus: function( itemLastUpdate, pendingKey ) {
			var labels = app.cacheView.labels;
			return (itemLastUpdate > pendingKey) ? labels.refreshed : labels.inProgress;
		}

	});

});
