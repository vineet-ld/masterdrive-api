const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const utils = require("./../utils/utils");

const mongoose = utils.getMongoose();

let UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 25,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: (val) => validator.isEmail(val),
            message: "{VALUE} is not a valid email"
        }
    },

    password: {
        type: String,
        required: true
    },

    createdOn: {
        type: Number,
        default: new Date().getTime()
    },

    modifiedOn: {
        type: Number,
        default: null
    },

    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]

});

/*
* Model method to create an authentication token
*
* @return: Promise with the auth token
* */
UserSchema.methods.createAuthToken = function() {

    let user = this;
    let access = "auth";
    let token = jwt.sign({
        _id: user._id.toHexString()
    }, process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save()
        .then(() => {
            return token;
        })
        .catch((error) => {
            utils.logError(500, error);
        })

};

/*
* Schema method to get user by its credentials
*
* @params:
* email - String
* password - String
*
* @returns:
* Promise with user object
*
* @throws:
* AuthenticationError
* */
UserSchema.statics.findByCredentials = function(email, password) {

    let User = this;

    return User.findOne({email})
        .then((user) => {
            if(!user) {
                return Promise.reject({name: "AuthenticationError"});
            }
            return new Promise((resolve, reject) => {

                bcrypt.compare(password, user.password, (error, result) => {
                    if(result) {
                        resolve(user);
                    } else {
                        reject({name: "AuthenticationError"});
                    }
                });

            });
        })

};

/*
* Schema method to get user by auth token
*
* @params:
* token - String
*
* @returns:
* Promise with user object
* */
UserSchema.statics.findByToken = function(token) {

    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch(error) {
        return Promise.reject(error);
    }

    return User.findOne({
        _id: decoded._id,
        "tokens.token": token,
        "tokens.access": "auth"
    });

};

/*
* Method to encrypt the password before it is saved in the database.
* The callback function is called before save() method is called on the model instance
* */
UserSchema.pre("save", function(next) {

    let user = this;

    if(user.isModified("password")) {

        bcrypt.genSalt(10, (error, salt) => {

            if(error) {
                utils.logError(500, error);
            } else {

                bcrypt.hash(user.password, salt, (error, hash) => {

                    if(error) {
                        utils.logError(500, error);
                    } else {
                        user.password = hash;
                        next();
                    }

                })

            }

        })

    } else {
        next();
    }

});

let User = mongoose.model("User", UserSchema);

module.exports = User;