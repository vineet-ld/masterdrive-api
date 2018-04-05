const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");

const User = require("./../models/user-model");
const utils = require("./../utils/utils");

const app = utils.getExpressApp();
const mongoose = utils.getMongoose();

const seed = (() => {

    return {

        /*
        * Method to clear the user table
        *
        * @params:
        * done - Callback Fn
        * */
        clearUsers: (done) => {
            User.remove({})
                .then(() => {
                    done();
                })
                .catch((error) => {
                    done(error);
                })
        },

        /*
        * Method to add a sample user
        *
        * @params:
        * done - Callback Fn
        * */
        addUser: (done) => {
            let userId = new ObjectID();
            let user = {
                _id: userId,
                name: "Test User",
                email: "test.user@test.com",
                password: "123456",
                createdOn: new Date().getTime(),
                tokens: [{
                    access: "auth",
                    token: jwt.sign({_id: userId}, process.env.JWT_SECRET)
                }]
            };
            let userObj = new User(user);
            userObj.save()
                .then(() => done())
                .catch((error) => done());
        }

    };

})();

module.exports = seed;