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

    process.env.LOG_LEVEL = "info";

} else {
    process.env.PORT = 3002;
    process.env.LOG_LEVEL = "all";
}

