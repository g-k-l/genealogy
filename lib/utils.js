module.exports = {
	uniquify: function(items) {
		var unique_ids = []
		var uniques = []
		for (var i = 0; i < items.length; i++) {
			if (!unique_ids.includes(items[i].math_id)) {
				unique_ids.push(items[i].math_id);
				uniques.push(items[i]);
			}
		}
		return uniques
	},
	// redirects www to non-www
	wwwRedirect: function(req, res, next) {
		if (req.headers.host.slice(0, 4) === 'www.') {
			var newHost = req.headers.host.slice(4);
			console.log(req.originalUrl);
			return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
		}
		next();
	}
}