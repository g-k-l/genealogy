const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const enforce = require("express-sslify");

const mongo = require("./lib/mongo");
const utils = require("./lib/utils");
const config = require("./config/config");
var collection_utils = require("./lib/collection_utils");

/*Heroku, nodejitsu and other hosters often use reverse proxies
  which offer SSL endpoints but then forward unencrypted HTTP
  traffic to the website. This makes it difficult to detect if
  the original request was indeed via HTTPS. Luckily, most
  reverse proxies set the x-forwarded-proto header flag with
  the original request scheme. express-sslify is ready for such
  scenarios, but you have to specifically request the evaluation 
  of this flag: { trustProtoHeader: true }. Also, we need to set
  { trustXForwardedHostHeader: true } as well so we can use the
  x-forwarded-host header to redirect http to https*/
app.use(enforce.HTTPS({ trustXForwardedHostHeader: true, trustProtoHeader: true }));

/* Static middleware */
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

function logListen(port) {
  console.log("Listening on port: " + port);
}

// start app here
mongo.connect(function(database) {
  var mongodb = database;
  var collection = mongodb.collection("phds2");
  collection_utils = collection_utils.init(collection);

  if (config.ENV === "PRODUCTION") {
    http.createServer(app)
        .listen(config.PORT, logListen(config.PORT))
  } else {
    /* Use self-signed credentials for local development */
    var options = {
      key: fs.readFileSync('./config/server.key'),
      cert: fs.readFileSync('./config/server.crt'),
    }
    https.createServer(options, app)
         .listen(config.PORT, logListen(config.PORT))
  }
});
