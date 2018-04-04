const expect = require("expect");

const exception = require("./../../utils/errors");

describe("Errors", () => {

    describe("Exception", () => {

        it("should return error response with ValidationError", () => {

            let errorObj = {
                name: "ValidationError",
                errors: {
                    test: {
                        message: "This is a test error message"
                    }
                }
            };

            let errorResponse = exception(errorObj);
            expect(errorResponse).toBeDefined();
            expect(errorResponse.type).toBe("ValidationError");
            expect(errorResponse.status).toBe(400);
            expect(errorResponse.messages).toContain("This is a test error message");

        });

        it("should return error response with DuplicateEntryError", () => {

            let errorObj = {
                name: "BulkWriteError",
                code: 11000,
                message: "This is a test error message"
            };

            let errorResponse = exception(errorObj);
            expect(errorResponse).toBeDefined();
            expect(errorResponse.type).toBe("DuplicateEntryError");
            expect(errorResponse.status).toBe(409);
            expect(errorResponse.messages).toContain("This is a test error message");

        });

        it("should return error response with ServerError", () => {

            let errorObj = {};

            let errorResponse = exception(errorObj);
            expect(errorResponse).toBeDefined();
            expect(errorResponse.type).toBe("ServerError");
            expect(errorResponse.status).toBe(500);
            expect(errorResponse.messages).toContain("Something went wrong on the server");

        });

    })

});