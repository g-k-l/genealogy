require("dotenv").config()

module.exports = {
    ENV: process.env.ENVIRONMENT,
    PORT: process.env.ENVIRONMENT === "PRODUCTION" ? 80: 8080,
    mongo_uri: process.env.MONGO_URI
}