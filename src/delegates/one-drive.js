const querystring = require("querystring");
const axios = require("axios");

const Drive = require("./drive");

const SCOPES = "onedrive.readwrite offline_access";
const client_id = process.env.ONE_DRIVE_CLIENT_ID;
const client_secret = process.env.ONE_DRIVE_CLIENT_SECRET;
const redirect_uri = `${process.env.FE_DOMAIN}/onedrive/permission`;

class OneDrive extends Drive {

    /*
    * Method to get the authentication url
    *
    * @returns:
    * authUrl - String
    * */
    getAuthenticationUrl() {
        return `https://login.live.com/oauth20_authorize.srf?client_id=${client_id}&scope=${SCOPES}&response_type=code
        &redirect_uri=${redirect_uri}`;
    }

    /*
    * Method to get the authentication token
    *
    * @params:
    * code - String
    * */
    getToken(code) {
        let data = {
            client_id,
            client_secret,
            redirect_uri,
            code,
            grant_type: "authorization_code"
        };
        return axios.post("https://login.live.com/oauth20_token.srf", querystring.stringify(data),
            {"Content-Type": "application/x-www-form-urlencoded"});
    }

}

module.exports = OneDrive;