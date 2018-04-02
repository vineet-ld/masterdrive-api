require("./config");

const express = require("express");
const log4js = require("log4js");
const bodyParser = require("body-parser");

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
        }

    };

})();

module.exports = utils;