const _ = require("lodash");

const utils = require("./../utils/utils");

const mongoose = utils.getMongoose();

let AccountSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50,
        unique: true
    },

    type: {
        type: String,
        required: true
    },

    key: {
        type: String,
        default: null
    },

    _owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    createdOn: {
        type: Number,
        default: _.now()
    },

    modifiedOn: {
        type: Number,
        default: null
    }

});

/*
* Schema method to get accounts by type
*
* @params:
* type - String
* _owner - Number
*
* @returns:
* Promise with account object
* */
AccountSchema.statics.findByType = function(type, _owner) {

    let Account = this;

    return Account.find({type, _owner});

};

/*
* Schema method to get accounts by owner
*
* @params:
* _owner - Number
*
* @returns:
* Promise with account object
* */
AccountSchema.statics.findByOwner = function(_owner) {

    let Account = this;

    return Account.find({_owner});

};

let Account = mongoose.model("Account", AccountSchema);

module.exports = Account;