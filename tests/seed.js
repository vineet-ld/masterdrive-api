const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const User = require("../src/models/user-model");
const Account = require("../src/models/account-model");
const utils = require("../src/utils/utils");

const app = utils.getExpressApp();
const mongoose = utils.getMongoose();

const seed = (() => {

    let userId = new ObjectID();

    let user1 = {
        _id: userId,
        name: "Test User",
        email: "test.user@test.com",
        password: "123456",
        verified: true,
        createdOn: _.now(),
        tokens: [{
            access: "auth",
            token: jwt.sign({_id: userId}, process.env.JWT_SECRET)
        }, {
            access: "auth",
            token: jwt.sign({_id: new ObjectID()}, process.env.JWT_SECRET)
        }, {
            access: "temp",
            token: jwt.sign({_id: userId}, process.env.JWT_SECRET)
        }, {
            access: "reset",
            token: jwt.sign({_id: userId}, process.env.JWT_SECRET)
        }, {
            access: "verify",
            token: jwt.sign({email: "test.user@test.com"}, process.env.JWT_SECRET)
        }]
    };

    let user2 = {
        _id: new ObjectID(),
        name: "Test User",
        email: "unverified.user@test.com",
        password: "123456",
        verified: false,
        createdOn: _.now()
    };

    let account = {
        _id: new ObjectID(),
        name: "Test Account",
        type: "TEST_DRIVE",
        key: null,
        _owner: user1._id,
        createdOn: _.now(),
        modifiedOn: null
    };

    return {

        /*
        * Method to add a sample user
        *
        * @params:
        * done - Callback Fn
        * */
        addUser: (done) => {

            User.remove({})
                .then(() => {
                    let promise1 = new User(user1).save();
                    let promise2 = new User(user2).save();
                    return Promise.all([promise1, promise2]);
                })
                .then(() => done());

        },

        /* Method to get the user
        *
        * @returns:
        * user - Object
        * */
        getUser: () => {
            return user1;
        },

        /*
        * Method to clear the accounts
        *
        * @params:
        * done - Callback Fn
        * */
        clearAccounts: (done) => {
            Account.remove({})
                .then(() => {
                    return new Account(account).save();
                })
                .then(() => done());
        }

    };

})();

module.exports = seed;