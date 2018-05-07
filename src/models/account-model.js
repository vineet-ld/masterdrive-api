const _ = require("lodash");

const utils = require("../utils/utils");

const mongoose = utils.getMongoose();

let AccountSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },

    type: {
        type: String,
        required: true
    },

    key: {
        type: Object,
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
* Method to append text so that account name is not duplicated.
* The callback function is called before save() method is called on the model instance
* */
AccountSchema.pre("save", function(next) {

    let account = this;

    Account.find({name: account.name, _owner: account._owner})
        .then((accounts) => {
            if(accounts.length === 1 && accounts[0]._id.toHexString() !== account._id.toHexString()) {
                account.name = `${account.name}_${_.now()}`;
            }
            next();
        })
        .catch((error) => {
            utils.logError(500, error);
        })

});

let Account = mongoose.model("Account", AccountSchema);

module.exports = Account;