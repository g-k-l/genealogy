require("dotenv").config()

/* Heroku populates process.env.PORT for the app
   to listen to on production */
module.exports = {
    ENV: process.env.ENVIRONMENT,
    PORT: process.env.ENVIRONMENT === "PRODUCTION" ? process.env.PORT: 8080,
    mongo_uri: process.env.MONGO_URI
}