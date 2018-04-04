const _ = require("lodash");

const utils = require("./../utils/utils");
const User = require("./../models/user-model");
const middleware = require("./../utils/middleware");
const exception = require("./../utils/errors");

const app = utils.getExpressApp();
const logger = utils.getLogger();

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



