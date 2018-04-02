const expect = require("expect");
const utils = require("./../../utils/utils");

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
            expect(logger.level.levelStr).toBe("ALL");

        });

    })

});

