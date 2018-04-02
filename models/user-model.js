const validator = require("validator");

const utils = require("./../utils/utils");

const mongoose = utils.getMongoose();

let UserSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 25,
        trim: true
    },

    email: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 25,
        trim: true,
        validate: {
            validator: (val) => validator.isEmail(val),
            message: "{VALUE} is not a valid email"
        }
    },

    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 25,
        validate: {
            validator: (val) => validator.matches(val,
                /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8}$/),
            message: "{VALUE} is not a valid password"
        }
    },

    createdOn: {
        type: Number,
        default: new Date().getTime()
    },

    modifiedOn: {
        type: Number,
        default: null
    }

});

let User = mongoose.model("User", UserSchema);

module.exports = User;