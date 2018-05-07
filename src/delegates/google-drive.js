const {google} = require("googleapis");

const Drive = require("./drive");

const OAuth2Client = google.auth.OAuth2;
const SCOPES = ["https://www.googleapis.com/auth/drive"];

class GoogleDrive extends Drive {

    /*
    * Constructor method for GoogleDrive class
    * */
    constructor() {
        super();
        this.oAuth2Client = new OAuth2Client(process.env.GOOGLE_DRIVE_CLIENT_ID,
            process.env.GOOGLE_DRIVE_CLIENT_SECRET, `${process.env.FE_DOMAIN}/googledrive/permission/`);
    }

    /*
    * Method to retrieve the authentication url from google drive api
    *
    * @returns:
    * authUrl - String
    * */
    getAuthenticationUrl() {
        return this.oAuth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
    }

    /*
    * Method to get the authentication token
    *
    * @params:
    * code - String
    * */
    getToken(code) {
        return this.oAuth2Client.getToken(code);
    }

}

module.exports = GoogleDrive;