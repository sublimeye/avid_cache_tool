define(function () {

	Storage.prototype.setObject = function (key, value) {
		this.setItem(key, JSON.stringify(value));
	};

	Storage.prototype.getObject = function (key) {
		var value = this.getItem(key);
		return value && JSON.parse(value);
	};

	Storage.prototype.deleteObject = function (key) {
		delete this[key];
	};

});
