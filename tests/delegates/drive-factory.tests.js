const expect = require("expect");

const DriveFactory = require("./../../delegates/drive-factory");
const GoogleDrive = require("./../../delegates/google-drive");
const Dropbox = require("./../../delegates/dropbox");
const OneDrive = require("./../../delegates/one-drive");

describe("Drive Factory", () => {

    describe("Get a Drive instance", () => {

        it("Creates a Google Drive instance", () => {

            let drive = DriveFactory.create("GOOGLE_DRIVE");
            expect(drive).toBeDefined();
            expect(drive instanceof GoogleDrive).toBeTruthy();

        });

        it("Creates a Dropbox instance", () => {

            let drive = DriveFactory.create("DROPBOX");
            expect(drive).toBeDefined();
            expect(drive instanceof Dropbox).toBeTruthy();

        });

        it("Creates a One Drive instance", () => {

            let drive = DriveFactory.create("ONE_DRIVE");
            expect(drive).toBeDefined();
            expect(drive instanceof OneDrive).toBeTruthy();

        });

    });

});