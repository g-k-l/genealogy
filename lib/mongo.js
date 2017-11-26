var dotenv = require('dotenv').config()
var express = require('express')
var app = express()
var MongoClient = require('mongodb').MongoClient

module.exports = {
	connect: function(callback) {
		MongoClient.connect(process.env.MONGO_URI, function(error, database){
			if (error) {
				throw error
			}
			else {
				console.log("I got here")
				callback(database)
			}
		})
	}
}