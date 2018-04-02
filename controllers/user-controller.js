const utils = require("./../utils/utils");

const app = utils.getExpressApp();

app.get("/get", (request, response) => {
    response.send("Still Success");
});