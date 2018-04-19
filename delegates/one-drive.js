const Drive = require("./drive");

const SCOPES = "onedrive.readwrite";

class OneDrive extends Drive {

    /*
    * Method to get the authentication url
    *
    * @returns:
    * authUrl - String
    * */
    getAuthenticationUrl() {
        return `https://login.live.com/oauth20_authorize.srf?client_id=${process.env.ONE_DRIVE_CLIENT_ID}
        &scope=${SCOPES}&response_type=code&redirect_uri=${process.env.FE_DOMAIN}/onedrive/permission`;
    }

}

module.exports = OneDrive;