var express = require("express");
var app = express();
var path = require("path");
var mongo = require("./lib/mongo");
var utils = require("./lib/utils");
var collection_utils = require("./lib/collection_utils");
var config = require("./config/config");
var https = require("https")
var http = require("http")

app.set("trust proxy", true);
app.use(express.static(__dirname));
app.use(express.static(__dirname + "/client"));

app.route("/").get(function(req, res) {
  res.redirect("/v2")
});

app.route("/v1").get(function(req, res) {
  res.sendFile(__dirname + "/client/v1/tree.html");
})

app.route("/v2").get(function(req, res) {
  res.sendFile(__dirname + "/client/v2/tree.html");
})

app.route("/tree/:math_ids").get(function(req, res) {
  try {
    var id_array = req.params.math_ids.split(",").map(Number);
    collection_utils.fetchById(id_array, function(items) {
      res.json(items);
    });
  } catch (e) {
    res.json({ msg: "parseInt failed. Error: " + e });
  }
});

app.route("/tree/name/:root_name").get(function(req, res) {
  collection_utils.fetchByName(req.params.root_name, function(items) {
    res.json(items);
  });
});

// start app here
mongo.connect(function(database) {
  var mongodb = database;
  var collection = mongodb.collection("phds2");
  collection_utils = collection_utils.init(collection);

  if (config.ENV === "PRODUCTION") {
    https.createServer({}, app).listen(443);
  } else {
    http.createServer(app, function() {
      console.log("Listening at Port 80");
    }).listen(80)
  }
});
