define(['jquery'], function ($) {
	// Above we have passed in jQuery, Underscore and Backbone
	// They will not be accessible in the global scope
	var request = function ( path, method, data ) {

		if (data && method !== 'GET') {
			data = JSON.stringify(data);
		}

		var _BASE_URL = location.origin;

		/**
		 * Add special port number to pathname for local testing
		 */
		if (/avid-cache-tool/.test(_BASE_URL)) {
			_BASE_URL += ':8084';
		}

		var options = {
			url: _BASE_URL + '/CacheTool/' + path,
			accept: 'application/json',
			contentType: 'application/json',
			dataType: 'json',
			type: method,
			data: data
		};

		return $.ajax( options );
	};

	var API = {
		post: {
			auth: function( data ) {
				var path = 'auth',
					method = 'POST';

				return request( path, method, data);
			},

			update: function( data ) {
				var path = 'cache/update',
					method = 'POST';

				return request( path, method, data);
			}
		},

		get: {
			config: function() {
				var path = 'config/servers',
					method = 'GET';

				return request( path, method );
			},

			cache: function() {
				var path = 'cache/data',
					method = 'GET';

				return request( path, method );
			}
		}
	};

	return {API: API};
	// What we return here will be used by other modules
});
