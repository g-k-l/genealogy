var dotenv = require("dotenv").config()
var port = 8080

module.exports = {
    ENV: process.env.ENVIRONMENT,
    port: port,
    mongo_uri: process.env.MONGO_URI
}