const log4js = require("log4js");

let env = process.env.NODE_ENV || "development";

if(env !== "test" && env !== "development") {

    /*
     * Configuration of the logger object
     * Setting the logger to log in a .log file
     *
    */
    log4js.configure({
        appenders: {
            default: {
                type: "file",
                filename: `logs/${new Date().toDateString()}.log`
            }
        },
        categories: {
            default: {
                appenders: ['default'],
                level: 'all'
            }
        }
    });

} else {
    require("dotenv").load();
    if(env === "test") {
        process.env.MONGODB_URL = process.env.MONGODB_URL_TEST;
        process.env.LOG_LEVEL = "off";
    }
}



