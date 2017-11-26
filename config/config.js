var dotenv = require("dotenv").config()
var port = 80
if (process.env.ENVIRONMENT != "PRODUCTION") {
	port = 8080
} 
module.exports = {
	port: port,
	mongo_uri: process.env.MONGO_URI
}