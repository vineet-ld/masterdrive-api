const GoogleDrive = require("./google-drive");
const Dropbox = require("./dropbox");
const OneDrive = require("./one-drive");

const DriveFactory = {

    /*
    * Factory metod to create instances of sub-classes of Drive
    *
    * @params:
    * accountType - String GOOGLE_DRIVE | DROPBOX | ONE_DRIVE
    *
    * @returns:
    * drive instance - Object GoogleDrive | Dropbox | OneDrive
    * */
    create: (accountType) => {
        switch(accountType) {
            case "GOOGLE_DRIVE":
                return new GoogleDrive();
            case "DROPBOX":
                return new Dropbox();
            case "ONE_DRIVE":
                return new OneDrive();
            default:
                throw new Error("Invalid account type");
        }
    }

};

module.exports = DriveFactory;