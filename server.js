var express = require('express');
var app = express();
var http = require('http')
	.Server(app);
var path = require('path')
var MongoClient = require('mongodb')
	.MongoClient
var root = __dirname;
var mongo_url = 'mongodb://localhost:27017/geneology';

app.use(express.static(root));
app.use(express.static(root + "/client"));

http.listen(7000, function () {
	console.log('Listening at Port 7000');
});

app.route('/')
	.get(function (req, res) {
		res.sendFile(root + '/test.html')
	});

app.route('/tree')
	.get(function (req, res) {
		res.sendFile(root + '/client/tree.html')
	});

// obtains the info of phd with the speicified math_ids from the database
// returns an array of json docs
// Everything is strings! EVERYTHING.
app.route("/tree/:math_ids")
	.get(function (req, res) {
		MongoClient.connect(mongo_url, function (err, db) {
			if (err) console.log(err);
			try {
				var id_array = req.params.math_ids.split(',');
			} catch (e) {
				res.json({
					'msg': "parseInt failed. Error: " + e
				});
				return
			}
			console.log(id_array);
			var col = db.collection("phds");
			col.find({
					"math_id": {
						$in: id_array
					}
				})
				.toArray(function (err, items) {
					if (err) throw err;
					console.log(items);
					res.json(items);
				});
		});
	});
