const DropboxApi = require("dropbox").Dropbox;

const Drive = require("./drive");

class Dropbox extends Drive {

    /*
    * Constructor method for Dropbox class
    * */
    constructor() {
        super();
        this.dbx = null;
    }

    /*
    * Method to retrieve the authentication url from dropbox api
    *
    * @returns:
    * authUrl - String
    * */
    getAuthenticationUrl() {
        this.dbx = new DropboxApi({clientId: process.env.DROPBOX_CLIENT_ID});
        return this.dbx.getAuthenticationUrl(`${process.env.FE_DOMAIN}/dropbox/permission`);
    }

    /*
    * Method to get the authentication token
    *
    * @params:
    * code - String
    * */
    getToken(code) {
        return Promise.resolve({accessToken: code});
    }

}

module.exports = Dropbox;