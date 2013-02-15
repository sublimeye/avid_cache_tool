var serverPort = 8084;
var minResponseDelay = 0;
var maxResponseDelay = 500;

var http = require("http");
var url = require("url");

function start (route) {

	function onRequest (request, response) {
		// get path from request URL. http://host.com/go/here?help=no {return "/go/here"}
		var requestPath = url.parse(request.url).pathname;
		// request data {"param": "value"} {return Object}
		var requestData = '';
		
		var responseDelay = minResponseDelay + Math.random() * maxResponseDelay;		
		if ( ['/billbank/money', '/service/verify'].indexOf(requestPath) !== -1 ) {
			responseDelay += 1000;
		}

		request.on('data', function (data) {
			requestData += data;
		});

		request.on('end', function () {
			requestData = requestData && JSON.parse(requestData);

			setTimeout( function() {
				route(requestPath, requestData, response);
			} , responseDelay );
		});

	}

	http.createServer(onRequest).listen(serverPort);
	console.log("Server has started. On port: ", serverPort);
}

exports.start = start;
