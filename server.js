var express = require('express');
var app = express();
var http = require('http')
	.Server(app);
var path = require('path')
var MongoClient = require('mongodb')
	.MongoClient
var root = __dirname;
var mongo_url = 'mongodb://public_reader:1234*@ds149049.mlab.com:49049/phds';

app.use(express.static(root));
app.use(express.static(root + "/client"));

http.listen(80, function () {
	console.log('Listening at Port 80');
});

// main route
app.route('/')
	.get(function (req, res) {
		res.sendFile(root + '/client/tree.html')
	});

// obtains the info of phd with the speicified math_ids from the database
// returns an array of json docs
app.route("/tree/:math_ids")
	.get(function (req, res) {
		MongoClient.connect(mongo_url, function (err, db) {
			if (err) console.log(err);
			try {
				var id_array = req.params.math_ids.split(',')
					.map(Number);
			} catch (e) {
				res.json({
					'msg': "parseInt failed. Error: " + e
				});
				return
			}
			var col = db.collection("phds2");
			col.find({
					"math_id": {
						$in: id_array
					}
				})
				.toArray(function (err, items) {
					if (err) throw err;
					var unique_ids = [],
						uniques = [];
					for (var i = 0; i < items.length; i++) {
						if (!unique_ids.includes(items[i].math_id)) {
							unique_ids.push(items[i].math_id);
							uniques.push(items[i]);
						}
					}
					res.json(uniques);
				});
		});
	});

app.route("/tree/name/:root_name")
	.get(function (req, res) {
		MongoClient.connect(mongo_url, function (err, db) {
			if (err) console.log(err);
			var col = db.collection("phds2");
			col.find({
					"name": {
						$regex: req.params.root_name
					}
				})
				.toArray(function (err, items) {
					if (err) throw err;
					var unique_ids = [],
						uniques = [];
					for (var i = 0; i < items.length; i++) {
						if (!unique_ids.includes(items[i].math_id)) {
							unique_ids.push(items[i].math_id);
							uniques.push(items[i]);
						}
					}
					console.log(uniques);
					res.json(uniques);
				});
		})
	});
