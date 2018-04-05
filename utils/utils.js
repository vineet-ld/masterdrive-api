require("./config");

const express = require("express");
const log4js = require("log4js");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

let utils = (() => {

    let app;
    let logger;

    app = express();
    app.use(bodyParser.json());

    logger = log4js.getLogger();
    logger.level = process.env.LOG_LEVEL;

    return {

        /*
        * Method to get the instance of the express app
        *
        * @returns: app - Object
        * */
        getExpressApp: () => {
            return app;
        },

        /*
        * Method to get the Log4js logger instance
        *
        * @returns: logger - Object
        * */
        getLogger: () => {
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
        },

        /*
        * Method to log general information
        *
        * @params
        * status: Number - HTTP Status Code
        * data: Object - HTTP Response Body
        * */
        logInfo: (status, data) => {
            logger.info(`Status: ${status}`, "\n", data);
        },

        /*
        * Method to log system and/or user errors
        *
        * @params
        * status: Number - HTTP Status Code
        * error: Object
        * */
        logError: (status, error) => {
            if(status >= 500) {
                logger.fatal(`Status: ${status}`, "\n", error);
            } else {
                switch(status) {
                    case 400:
                        logger.error(`Status: ${status}`, "\n", error);
                        break;

                    case 401:
                    case 409:
                        logger.warn(`Status: ${status}`, "\n", error);
                        break;
                }

            }
        }

    };

})();

module.exports = utils;