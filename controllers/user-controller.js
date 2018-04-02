const _ = require("lodash");

const utils = require("./../utils/utils");
const User = require("./../models/user-model");

const app = utils.getExpressApp();
const logger = utils.getLogger();

app.post("/user", (request, response) => {

    let requestBody = _.pick(request.body, ["name", "email", "password"]);
    let user = new User(requestBody);

    user.save()
        .then((user) => {
            response.send(user);
        })
        .catch((error) => {
            response.status(400).send(error);
        })

});

