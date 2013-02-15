var IBOX_APP = require("./api");
var _$ = require("./utils");

function route (path, data, response) {
	console.log('Request', path);

	var responseData = getResponseData(path, data);

	response.writeHead(200, {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'content-type',
		'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'}
	);
	response.write(responseData);
	response.end();
}

function getResponseData (path, data) {
	// default response; In case we don't have API handler
	var responseData = {"ok": false, error: {type: "timeout"}, "msg": "CANT FIND API HANDLER"};

	/**
	 * get API Handler
	 * For service verify returns response corresponding to provided service_id
	 * For other requests returns default values (as it worked before)
	 */
	var APIHandler = pathHandler.process(path, data);

	/**
	 * Get "custom" response_id ( index in the responses array ) (ex: billbank/money)
	 */
	var response_id = responseIdHandler.process(path, data) || 0; // 0 is default generic success

	/* If API handler exist , return first response element {ok: true} */
	if (APIHandler && APIHandler.response) {
		responseData = APIHandler.response[ response_id ];
	}

	if (path === '/service/verify') {
		responseData = _$.extend({}, responseData, { token: responseData.token + '_' + Date.now() });
	}

	/* stringify response obj before send it back to client */
	responseData = JSON.stringify(responseData);

	return responseData;
}

var responseIdHandler = {
	billbankActive: false,

	'/billbank/deactivate': function() {
		this.billbankActive = false;
	},

	'/billbank/activate': function() {
		this.billbankActive = true;
	},

	'/billbank/money': function(path, data) {
		var response_id;

		if (!this.billbankActive) {
			response_id = 1;
		}

		if (!data.token) {
			response_id = 2;
		}

		return response_id;
	},

	'/auth/login': function(path, data) {
		//stupid condition for unit-tests (if we send data without login, return ok:true)
		if (!data.password) {
			return 1;
		}

		if (data.password !== ".") {
			return 1;
		}
	},

	process: function(path, data) {
		if (this[path]) {
			return this[path](path, data);
		}
	}

};

var pathHandler = {
	'/service/verify': function(path, data) {
		var theResponse = IBOX_APP.API[path],
				responses = IBOX_APP.API[path].responses;

		// If IBOX.API has multiple responses object
		if (responses) {

			// walk through every multiple responses item
			Object.keys(responses).forEach(function(response_type) {
				var r = responses[response_type],
						requestFilter = r.request;

				// request filter == custom named response , like "mobile"; This name is only for presentation

					// loop over all request properties / filters for each request type
					// ex: service_id, token
					for ( var filter_key in requestFilter ) {if (requestFilter.hasOwnProperty(filter_key)) {
						var filter = requestFilter[filter_key],
								filterArray = filter.split(',');

						// if filter property not in data - skip this "response item"
						if (!data[filter_key]) {
							return false;
						}

						// if property value in request data isn't in filtered data - skip
						if ( filterArray.indexOf(data[filter_key]) === -1 ) {
							return false;
						}
					}

					// current multiple response item has passed all filter options; assign response
					// if multiple responses have more than one response that passes the conditions
					// response of the last response type will be returned
					theResponse = r;

				}

			});
		}

		return theResponse;

	},

	process: function(path, data) {
		/**
		 * Very "dirty" concatenating of API objects; If two equal API names exist in
		 * concatenated objects, that would lead to FuckUp. (Theoretically this should never occur)
		 */
		var API = _$.extend({}, IBOX_APP.API);
		var responseData = API[path];

		/**
		 * If we have a "handler" for given path process it (ex: /service/verify)
		 */
		if (this[path]) {
			responseData = this[path](path, data);
		}

		return responseData;
	}
};

exports.route = route;
