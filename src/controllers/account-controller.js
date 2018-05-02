const _ = require("lodash");
const express = require("express");

const utils = require("../utils/utils");
const middleware = require("../utils/middleware");
const DriveFactory = require("../delegates/drive-factory");
const Account = require("../models/account-model");
const exception = require("../utils/errors");
const emailClient = require("../utils/email");

const app = utils.getExpressApp();
const router = express.Router();

router.use(middleware.authenticate);

/*
* Add a new drive account
*
* @params:
* name - String a name for the account
* type - String GOOGLE_DRIVE | DROPBOX | ONE_DRIVE
* @headers: x-auth - String
*
* @returns:
* account - Object
* authUrl - String url to enter user credentials for the account
*
* @throws:
* AuthenticationError
* ValidationError
* */
router.post("/", (request, response) => {

    let data = _.pick(request.body, ["name", "type"]);
    data._owner = request.user._id;
    data.name = data.name ? data.name : `${data.type}_${_.now()}`;

    if (utils.isValidAccount(data.type)) {

        let drive = DriveFactory.create(data.type);
        let authUrl = drive.getAuthenticationUrl();

        let account = new Account(data);
        account.save()
            .then((account) => {
                account = _.pick(account, ["_id", "name", "type", "createdOn", "modifiedOn"]);
                response.send({account, authUrl});
                utils.logInfo(200, {account, authUrl});

                emailClient.sendAccountAddedEmail(request.user.name, request.user.email, _.startCase(_.lowerCase(data.type)));
            })
            .catch((error) => {
                let errorResponse = exception(error);
                response.status(errorResponse.status).send(errorResponse);
            })

    } else {
        let errorResponse = exception({
            name: "ValidationError",
            message: "Path 'type' is missing or invalid"
        });
        response.status(errorResponse.status).send(errorResponse);
    }

});

app.use("/account", router);