var config = require("./config/config")
var express = require('express')
var app = express()
var path = require('path')
var MongoClient = require('mongodb').MongoClient
var root = __dirname;
var mongo_uri = config.mongo_uri;
var utils = require("./lib/utils")

app.set('trust proxy', true);
app.use(utils.wwwRedirect);
app.use(express.static(root));
app.use(express.static(root + "/client"));

// main route
app.route('/').get(
	function(req, res) {
		res.sendFile(root + '/client/tree.html')
	}
);

// DB related routes here
MongoClient.connect(mongo_uri, function(err, db) {
	if (err) console.log(err);
	var col = db.collection("phds2")
		// obtains the info of phd with the speicified math_ids from the database
		// returns an array of json docs, each is a phd
	app.route(
		"/tree/:math_ids"
	).get(function(req, res) {
		try {
			var id_array = req.params.math_ids.split(',').map(Number)
		} catch (e) {
			res.json({
				'msg': "parseInt failed. Error: " + e
			})
			return
		}
		col.find({
				"math_id": {
					$in: id_array
				}
			})
			.toArray(function(err, items) {
				if (err) {
					throw err
				} else {
					uniques = utils.uniquify(items)
				}
				res.json(uniques);
			});
	});

	// search the database by phd name
	app.route("/tree/name/:root_name")
		.get(function(req, res) {
			col.find({
					"name": {
						$regex: req.params.root_name
					}
				})
				.toArray(function(err, items) {
					if (err) {
						throw err
					} else {
						uniques = utils.uniquify(items)
						res.json(uniques);
					}
				});
		});
});

app.listen(8080, function() {
	console.log('Listening at Port 8080');
});