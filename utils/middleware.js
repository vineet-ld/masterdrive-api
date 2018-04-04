const utils = require("./utils");
const logger = utils.getLogger();

let middleware = (() => {

    return {

        logHttpRequest: (request, response, next) => {
            logger.info(request.method, request.originalUrl, "\n", request.body);
            next();
        }

    };

})();

module.exports = middleware;