require("./config");

const express = require("express");
const log4js = require("log4js");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

let utils = (() => {

    let app;
    let logger;

    return {

        /*
        * Method to get the instance of the express app
        *
        * @returns: app - Object
        * */
        getExpressApp: () => {
            if(!app) {
                app = express();
                app.use(bodyParser.json());
            }
            return app;
        },

        /*
        * Method to get the Log4js logger instance
        *
        * @returns: logger - Object
        * */
        getLogger: () => {
            if(!logger) {
                logger = log4js.getLogger();
                logger.level = process.env.LOG_LEVEL;
            }
            return logger;
        },

        /*
        * Method to get the instance of Mongoose
        *
        * @returns: mongoose - Object
        * */
        getMongoose: () => {
            mongoose.Promise = global.Promise;
            mongoose.connect(process.env.MONGODB_URL)
                .then((data) => {
                    logger.info(`Connected to MongoDB at ${process.env.MONGODB_URL}`)
                })
                .catch((error) => {
                    logger.error(`Error while connecting to MongoDB at ${process.env.MONGODB_URL}`, error);
                });
            return mongoose;
        }

    };

})();

module.exports = utils;