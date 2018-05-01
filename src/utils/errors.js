const _ = require("lodash");

const utils = require("./utils");

/*
* Error object to be returned as HttpResponse in case of an error
*
* @params:
* type - String
* status - Number Http Status Code
* */
function Error(type, status) {
    this.type = type;
    this.messages = [];
    this.status = status;
}

/*
* Method to generate an error response
*
* @params:
* error - JS Error Object
*
* @returns: errorResponse - Custom Error Object
* */
let exception = function(error) {

    let errorResponse = new Error();

    if(error && error.name === "ValidationError") {

        errorResponse.type = error.name;
        errorResponse.status = 400;

        _.values(error.errors).forEach((err) => {
            errorResponse.messages.push(err.message);
        });

        if(error.message) {
            errorResponse.messages.push(error.message);
        }

    } else if(error && error.name === "BulkWriteError" && error.code === 11000) {

        errorResponse.type = "DuplicateEntryError";
        errorResponse.status = 409;
        errorResponse.messages.push(error.message);

    } else if(error && (error.name === "AuthenticationError" || error.name === "JsonWebTokenError")) {

        errorResponse.type = "AuthenticationError";
        errorResponse.status = 401;
        errorResponse.messages.push(error.message || "Invalid user credentials");

    } else if(error && error.name === "AuthorizationError") {

        errorResponse.type = "AuthorizationError";
        errorResponse.status = 403;
        errorResponse.messages.push(error.message || "Access is denied");

    } else if(error && error.name === "ResourceNotFoundError") {

        errorResponse.type = "ResourceNotFoundError";
        errorResponse.status = 404;
        errorResponse.messages.push("Cannot find the requested resource");

    } else {

        errorResponse.type = "ServerError";
        errorResponse.status = 500;
        errorResponse.messages.push("Something went wrong on the server");

    }

    utils.logError(errorResponse.status, error);

    return errorResponse;

};

module.exports = exception;