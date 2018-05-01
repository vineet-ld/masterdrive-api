const expect = require("expect");

const utils = require("../../src/utils/utils");

describe("Utils", () => {

    describe("Get Express App", () => {

        it("should get an app instance", () => {

            let app = utils.getExpressApp();
            expect(app).toBeDefined();

        })

    });

    describe("Get Logger", () => {

        it("should get a log4js logger instance", () => {

            let logger = utils.getLogger();
            expect(logger).toBeDefined();
            expect(logger.level.levelStr).toBe("OFF");

        });

    });

    describe("Get Mongoose", () => {

        it("should get an instance of mongoose", () => {

            let mongoose = utils.getMongoose();
            expect(mongoose).toBeDefined();
            mongoose.connection.close();

        })

    });

});

