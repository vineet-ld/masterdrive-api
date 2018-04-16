const _ = require("lodash");
const {ObjectID} = require("mongodb");
const validator = require("validator");

const utils = require("./../utils/utils");
const User = require("./../models/user-model");
const middleware = require("./../utils/middleware");
const exception = require("./../utils/errors");
const emailClient = require("./../utils/email");

const app = utils.getExpressApp();

/*
* Creates a new user
*
* @params:
* name - String
* email - String
* password - String
*
* @returns:
* user - Object
* @headers: x-auth - String
*
* @throws:
* ValidationError
* DuplicateEntryError
* */
app.post("/user", (request, response) => {

    let requestBody = _.pick(request.body, ["name", "email", "password"]);
    let user = new User(requestBody);

    user.save()
        .then((user) => {
            return user.createToken("auth");
        })
        .then((token) => {
            let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
            response.header("x-auth", token).status(201).send(userResponse);
            utils.logInfo(201, userResponse);
            return user.createVerificationToken();
        })
        .then((token) => {
            let verificationUrl = `${process.env.FE_DOMAIN}/verify`;
            emailClient.sendWelcomeEmail(user.name, user.email, verificationUrl, token);
        })
        .catch((error) => {
            let errorResponse = exception(error);
            response.status(errorResponse.status).send(errorResponse);
        })

});

/*
*
* Verifies the user email
*
* @params:
* @header - x-verify - String
*
* @returns:
* user - Object
*
* @throws:
* AuthenticationError
* */
app.put("/user/verify", middleware.authenticateVerification, (request, response) => {

    request.user.verified = true;
    request.user.save()
        .then((user) => {
            let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
            response.send(userResponse);
            utils.logInfo(200, userResponse);
        })
        .catch((error) => {
            let errorResponse = exception(error);
            response.status(errorResponse.status).send(errorResponse);
        })

});

/*
* Sign in a user
*
* @params:
* email - String
* password - String
*
* @returns
* user - Object
* @header: x-auth - String
*
* @throws
* ValidationError
* AuthenticationError
* */
app.post("/user/login", (request, response) => {

    let requestBody = _.pick(request.body, ["email", "password"]);
    let user;

    if(!requestBody.email || !requestBody.password) {

        let error = {
            name: "ValidationError",
            errors: {}
        };

        if(!requestBody.email) {
            error.errors.email = {
                message: "Path 'email' is required"
            }
        }

        if(!requestBody.password) {
            error.errors.password = {
                message: "Path 'password' is required"
            }
        }

        let errorResponse = exception(error);
        response.status(errorResponse.status).send(errorResponse);

    } else {

        User.findByCredentials(requestBody.email, requestBody.password)
            .then((userObj) => {
                user = userObj;
                if(user.verified) {
                    return user.createToken("auth");
                } else {
                    user.createVerificationToken()
                        .then((token) => {
                            let verificationUrl = `${process.env.FE_DOMAIN}/verify`;
                            emailClient.sendVerificationEmail(user.name, user.email, verificationUrl, token);
                        });
                    return Promise.reject({
                        name: "AuthorizationError",
                        message: "User is not verified"
                    });
                }
            })
            .then((token) => {
                let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
                response.header("x-auth", token).send(userResponse);
                utils.logInfo(200, userResponse);
            })
            .catch((error) => {
                let errorResponse = exception(error);
                response.status(errorResponse.status).send(errorResponse);
            })

    }

});

/*
* Get logged in user
*
* @params:
* @header: x-auth - String
*
* @returns
* user - Object
*
* @throws
* AuthenticationError
* */
app.get("/user/me", middleware.authenticate, (request, response) => {
    let userResponse = _.pick(request.user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
    response.send(userResponse);
    utils.logInfo(200, userResponse);
});

/*
* Update the user info
*
* @params:
* name - String
* password - String
* @headers: x-auth - String
*
* @returns
* user - Object
* @headers: x-auth - String
*
* @throws
* AuthenticationError
* ValidationError
* */
app.put("/user", middleware.authenticate, (request, response) => {

    let requestBody = _.pick(request.body, ["name", "password"]);

    if(_.toPairs(requestBody).length > 0) {

        if(requestBody.name) {
            request.user.name = requestBody.name;
        }

        if(requestBody.password) {
            request.user.password = requestBody.password;
        }

        if(request.user.isModified("name") || requestBody.password) {

            request.user.modifiedOn = _.now();

            request.user.save()
                .then((user) => {

                    if(requestBody.password) {
                        user.removeAuthTokens()
                            .then((user) => {
                                return user.createToken("auth");
                            })
                            .then((token) => {
                                request.token = token;
                                let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
                                response.header("x-auth", request.token).send(userResponse);
                                utils.logInfo(200, userResponse);
                                emailClient.sendDetailsUpdatedConfirmation(user.name, user.email);
                            })
                            .catch((error) => {
                                let errorResponse = exception(error);
                                response.status(errorResponse.status).send(errorResponse);
                            });
                    } else {
                        let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
                        response.header("x-auth", request.token).send(userResponse);
                        utils.logInfo(200, userResponse);
                    }

                })
                .catch((error) => {
                    let errorResponse = exception(error);
                    response.status(errorResponse.status).send(errorResponse);
                })

        } else {
            response.status(304).send();
            utils.logInfo(304);
        }

    } else {
        let errorResponse = exception({
            name: "ValidationError",
            message: "Atleast one field is required"
        });
        response.status(errorResponse.status).send(errorResponse);
    }

});

/*
* Delete the auth token and logout the user
*
* @params:
* @headers: x-auth - String
*
* @throws:
* AuthenticationError
* */
app.delete("/user/logout", middleware.authenticate, (request, response) => {

    request.user.removeAuthToken(request.token)
        .then(() => {
            response.status(204).send();
            utils.logInfo(204);
        })
        .catch((error) => {
            let errorResponse = exception(error);
            response.status(errorResponse.status).send(errorResponse);
        })

});

/*
* Delete all auth tokens and logout user from all deveices
*
* @params:
* @headers: x-auth - String
*
* @throws:
* AuthenticationError
* */
app.delete("/user/logout/all", middleware.authenticate, (request, response) => {

    request.user.removeAuthTokens()
        .then(() => {
            response.status(204).send();
            utils.logInfo(204);
        })
        .catch((error) => {
            let errorResponse = exception(error);
            response.status(errorResponse.status).send(errorResponse);
        })

});

/*
* Initiate password reset by creating a temporary token
*
* @params:
* email - String
*
* @throws:
* ValidationError
* ResourceNotFoundError
* */
app.post("/user/password/reset/init", (request, response) => {

    let email = request.body.email;
    let redirectUrl = `${process.env.FE_DOMAIN}/password/reset`;

    if(email) {

        User.findOne({email})
            .then((user) => {
                if(!user) {
                    return Promise.reject({
                        name: "ResourceNotFoundError"
                    });
                }
                user.createToken("temp")
                    .then((token) => {
                        response.status(202).send();
                        utils.logInfo(202);
                        emailClient.sendPasswordResetLink(user.name, email, redirectUrl, token);
                    })
            })
            .catch((error) => {
                let errorResponse = exception(error);
                response.status(errorResponse.status).send(errorResponse);
            });


    } else {
        let errorResponse = exception({
            name: "ValidationError",
            message: "Path 'email' is required"
        });
        response.status(errorResponse.status).send(errorResponse);
    }

});

/*
* Get the password reset token
*
* @params:
* @headers: x-code - String
*
* @returns:
* @headers: x-reset - String
*
* @throws:
* AuthenticationError
* */
app.get("/user/password/reset/token", middleware.authenticateOnce, (request, response) => {

    request.user.createToken("reset")
        .then((token) => {
            response.header("x-reset", token).send();
            utils.logInfo(200);
        })
        .catch((error) => {
            let errorResponse = exception(error);
            response.status(errorResponse.status).send(errorResponse);
        });

});

/*
* Update the password
*
* @params:
* password - String
*
* @returns:
* user - Object
* @headers: x-auth - String
*
* @throws:
* AuthenticationError
* ValidationError
* */
app.put("/user/password/reset", middleware.authenticateReset, (request, response) => {

    let password = request.body.password;

    if(password) {

        let user = request.user;
        user.password = password;
        user.modifiedOn = _.now();
        user.tokens = [];

        user.createToken("auth")
            .then((token) => {
                let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
                response.header("x-auth", token).send(userResponse);
                utils.logInfo(200, userResponse);
                emailClient.sendDetailsUpdatedConfirmation(user.name, user.email);
            })
            .catch((error) => {
                let errorResponse = exception(error);
                response.status(errorResponse.status).send(errorResponse);
            })

    } else {
        let errorResponse = exception({
            name: "ValidationError",
            message: "Path 'password' is required"
        });
        response.status(errorResponse.status).send(errorResponse);
    }

});


