const utils = require("./utils/utils");
const middleware = require("./utils/middleware");

const logger = utils.getLogger();
const app = utils.getExpressApp();

app.use(middleware.logHttpRequest);

require("./controllers/user-controller");

/* Setting express to listen to port 3002 */
app.listen(process.env.PORT, () => {
    logger.info(`Server started on port ${process.env.PORT}`);
});