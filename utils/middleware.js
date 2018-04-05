const utils = require("./utils");
const exception = require("./errors");
const User = require("./../models/user-model");

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

            User.findByToken(token)
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
                })
        }

    };

})();

module.exports = middleware;