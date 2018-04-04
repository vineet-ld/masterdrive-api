const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");

const User = require("./../models/user-model");
const utils = require("./../utils/utils");

const app = utils.getExpressApp();
const mongoose = utils.getMongoose();

const seed = (() => {

    return {

        clearUsers: (done) => {
            User.remove({})
                .then(() => {
                    done();
                })
                .catch((error) => {
                    done(error);
                })
        },

        addUser: (user) => {
            let objectId = new ObjectID();
            user._id = objectId;
            user.createdOn = new Date().getTime();
            user.tokens = [{
                access: "auth",
                token: jwt.sign({_id: objectId}, process.env.JWT_SECRET)
            }];
            let userObj = new User(user)
            userObj.save();
        }

    };

})();

module.exports = seed;