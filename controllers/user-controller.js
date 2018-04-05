const _ = require("lodash");

const utils = require("./../utils/utils");
const User = require("./../models/user-model");
const middleware = require("./../utils/middleware");
const exception = require("./../utils/errors");

const app = utils.getExpressApp();
const logger = utils.getLogger();

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
*
* @headers:
* x-auth - String
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
            return user.createAuthToken();
        })
        .then((token) => {
            let userResponse = _.pick(user, ["_id", "name", "email", "createdOn", "modifiedOn"]);
            response.header("x-auth", token).status(201).send(userResponse);
            utils.logInfo(201, userResponse);
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
*
* @header:
* x-auth - String
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
                return user.createAuthToken();
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



