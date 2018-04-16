const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const User = require("./../models/user-model");
const utils = require("./../utils/utils");

const app = utils.getExpressApp();
const mongoose = utils.getMongoose();

const seed = (() => {

    let userId = new ObjectID();

    let user = {
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

    return {

        /*
        * Method to clear the user table
        *
        * @params:
        * done - Callback Fn
        * */
        /*clearUsers: (done) => {
            User.remove({})
                .then(() => done())
                .catch((error) => done());
        },*/

        /*
        * Method to add a sample user
        *
        * @params:
        * done - Callback Fn
        * */
        addUser: (done) => {

            User.remove({})
                .then(() => {
                    let promise1 = new User(user).save();
                    let promise2 = new User(user2).save();
                    return Promise.all([promise1, promise2]);
                })
                .then(() => done());

        },

        addUnverifiedUser: (done) => {
            user.verified = false;
            user._id = new ObjectID();
            user.email = "unverified.user@test.com";
            let userObj = new User(user);
            userObj.save()
                .then(() => done())
                .catch((error) => done());
        },

        /* Method to get the user
        *
        * @returns:
        * user - Object
        * */
        getUser: () => {
            return user;
        }

    };

})();

module.exports = seed;