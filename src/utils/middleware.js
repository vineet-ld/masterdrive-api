const _ = require("lodash");
const {ObjectID} = require("mongodb");

const utils = require("./utils");
const exception = require("./errors");
const User = require("../models/user-model");
const Account = require("../models/account-model");

const logger = utils.getLogger();

let middleware = (() => {

    return {

        /*
        * Method to log the Http Request
        *
        * @params:
        * request - HttpRequest Object
        * response - HttpResponse Object
        * next - Callback Fn
        * */
        logHttpRequest: (request, response, next) => {
            logger.info(request.method, request.originalUrl, "\n", request.body);
            next();
        },

        /*
        * Method to check if incoming requests have a valid auth token
        *
        * @params:
        * request - HttpRequest Object
        * response - HttpResponse Object
        * next - Callback Fn
        *
        * @throws:
        * AuthenticationError
        * */
        authenticate: (request, response, next) => {
            let token = request.header("x-auth");

            User.findByToken(token, "auth")
                .then((user) => {
                    if(!user) {
                        return Promise.reject({
                            name: "JsonWebTokenError",
                            message: "invalid token"
                        });
                    }
                    request.user = user;
                    request.token = token;
                    next();
                })
                .catch((error) => {
                    let errorResponse = exception(error);
                    response.status(errorResponse.status).send(errorResponse);
                });
        },

        /*
        * Method to check if incoming request has valid temporary token and generate a reset token
        *
        * @params:
        * request - HttpRequest Object
        * response - HttpResponse Object
        * next - Callback Fn
        *
        * @throws:
        * AuthenticationError
        * */
        authenticateOnce: (request, response, next) => {

            let token = request.header("x-code");

            User.findByToken(token, "temp")
                .then((user) => {
                    if(!user) {
                        return Promise.reject({
                            name: "JsonWebTokenError",
                            message: "invalid token"
                        });
                    }
                    user.tokens = _.remove(user.tokens, (tokenObj) => tokenObj.access !== "temp");
                    request.user = user;
                    next();
                })
                .catch((error) => {
                    let errorResponse = exception(error);
                    response.status(errorResponse.status).send(errorResponse);
                });

        },

        /*
        * Method to check if incoming request has valid reset token
        *
        * @params:
        * request - HttpRequest Object
        * response - HttpResponse Object
        * next - Callback Fn
        *
        * @throws:
        * AuthenticationError
        * */
        authenticateReset: (request, response, next) => {

            let token = request.header("x-reset");
            User.findByToken(token, "reset")
                .then((user) => {
                    if(!user){
                        return Promise.reject({
                            name: "JsonWebTokenError",
                            message: "invalid token"
                        });
                    }
                    request.user = user;
                    next();
                })
                .catch((error) => {
                    let errorResponse = exception(error);
                    response.status(errorResponse.status).send(errorResponse);
                });
        },

        /*
        * Method to check if incoming request has valid verification token
        *
        * @params:
        * request - HttpRequest Object
        * response - HttpResponse Object
        * next - Callback Fn
        *
        * @throws:
        * AuthenticationError
        * */
        authenticateVerification: (request, response, next) => {

            let token = request.header("x-verify");
            User.findByVerificationToken(token)
                .then((user) => {
                    if(!user){
                        return Promise.reject({
                            name: "JsonWebTokenError",
                            message: "invalid token"
                        });
                    }
                    user.tokens = _.remove(user.tokens, (tokenObj) => tokenObj.access !== "verify");
                    request.user = user;
                    next();
                })
                .catch((error) => {
                    let errorResponse = exception(error);
                    response.status(errorResponse.status).send(errorResponse);
                });
        },

        authenticateAccount: (request, response, next) => {

            let accountId = request.params.id;

            if(!ObjectID.isValid(accountId)) {
                let errorResponse = exception({
                    name: "ResourceNotFoundError"
                });
                response.status(errorResponse.status).send(errorResponse);
            } else {

                Account.findById(accountId)
                    .then((account) => {
                        if(!account) {
                            return Promise.reject({
                                name: "ResourceNotFoundError"
                            });
                        }
                        if(request.user._id.toHexString() === account._owner.toHexString()) {
                            request.account = account;
                            next();
                        } else {
                            return Promise.reject({
                                name: "JsonWebTokenError",
                                message: "Not authorized to access the resource"
                            });
                        }
                    })
                    .catch((error) => {
                        let errorResponse = exception(error);
                        response.status(errorResponse.status).send(errorResponse);
                    });

            }

        }

    };

})();

module.exports = middleware;