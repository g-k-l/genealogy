require("dotenv").config()

/* Heroku populates process.env.PORT for the app
   to listen to on production */
module.exports = {
    ENV: process.env.ENVIRONMENT,
    PORT: process.env.ENVIRONMENT === "PRODUCTION" ? process.env.PORT: 8080,
    mongo_uri: process.env.MONGO_URI,
    TICTACTOE_URL_PATH: process.env.TICTACTOE_URL_PATH,
    TICTACTOE_BUCKET_NAME: process.env.TICTACTOE_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
}