require("../../src/controllers/account-controller");

const expect = require("expect");
const request = require("supertest");
const _ = require("lodash");

const utils = require("../../src/utils/utils");
const Account = require("../../src/models/account-model");
const seed = require("../seed");

const app = utils.getExpressApp();

beforeEach(seed.addUser);
beforeEach(seed.clearAccounts);

describe("Account Controller", () => {

    describe("POST /account", () => {

        it("should create a Google Drive account", (done) => {

            let data = {
                name: "Google Drive Test Account",
                type: "GOOGLE_DRIVE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(200)
                .expect((response) => {
                    let account = response.body.account;
                    expect(account._id).toBeDefined();
                    expect(account.name).toBe(data.name);
                    expect(account.type).toBe(data.type);
                    expect(account.createdOn).toBeDefined();
                    expect(account.modifiedOn).toBeNull();
                    expect(account._owner).toBeUndefined();
                    expect(account.key).toBeUndefined();

                    let authurl = response.body.authUrl;
                    expect(authurl).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        done(error);
                    }
                    Account.findById(response.body.account._id)
                        .then((account) => {
                            expect(account).toBeDefined();
                            expect(account.name).toBe(data.name);
                            expect(account.type).toBe(data.type);
                            expect(account.key).toBeNull();
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should create a Dropbox account", (done) => {

            let data = {
                name: "DropbBox Test Account",
                type: "DROPBOX"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(200)
                .expect((response) => {
                    let account = response.body.account;
                    expect(account._id).toBeDefined();
                    expect(account.name).toBe(data.name);
                    expect(account.type).toBe(data.type);
                    expect(account.createdOn).toBeDefined();
                    expect(account.modifiedOn).toBeNull();
                    expect(account._owner).toBeUndefined();
                    expect(account.key).toBeUndefined();

                    let authurl = response.body.authUrl;
                    expect(authurl).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        done(error);
                    }
                    Account.findById(response.body.account._id)
                        .then((account) => {
                            expect(account).toBeDefined();
                            expect(account.name).toBe(data.name);
                            expect(account.type).toBe(data.type);
                            expect(account.key).toBeNull();
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should create a One Drive account", (done) => {

            let data = {
                name: "One Drive Test Account",
                type: "ONE_DRIVE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(200)
                .expect((response) => {
                    let account = response.body.account;
                    expect(account._id).toBeDefined();
                    expect(account.name).toBe(data.name);
                    expect(account.type).toBe(data.type);
                    expect(account.createdOn).toBeDefined();
                    expect(account.modifiedOn).toBeNull();
                    expect(account._owner).toBeUndefined();
                    expect(account.key).toBeUndefined();

                    let authurl = response.body.authUrl;
                    expect(authurl).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        done(error);
                    }
                    Account.findById(response.body.account._id)
                        .then((account) => {
                            expect(account).toBeDefined();
                            expect(account.name).toBe(data.name);
                            expect(account.type).toBe(data.type);
                            expect(account.key).toBeNull();
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should return 401 if authentication token is absent", (done) => {

            let data = {
                name: "One Drive Test Account",
                type: "ONE_DRIVE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .send(data)
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
                })
                .end((error) => {
                    if(error) {
                        done(error);
                    }
                    Account.findByType("ONE_DRIVE", user._id)
                        .then((account) => {
                            expect(account.length).toBe(0);
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should add a default name if account name is not provided", (done) => {

            let data = {
                type: "ONE_DRIVE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(200)
                .expect((response) => {
                    let account = response.body.account;
                    expect(account._id).toBeDefined();
                    expect(_.startsWith(account.name, data.type)).toBeTruthy();
                    expect(account.type).toBe(data.type);
                    expect(account.createdOn).toBeDefined();
                    expect(account.modifiedOn).toBeNull();
                    expect(account._owner).toBeUndefined();
                    expect(account.key).toBeUndefined();

                    let authurl = response.body.authUrl;
                    expect(authurl).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        done(error);
                    }
                    Account.findById(response.body.account._id)
                        .then((account) => {
                            expect(account).toBeDefined();
                            expect(_.startsWith(account.name, data.type)).toBeTruthy();
                            expect(account.type).toBe(data.type);
                            expect(account.key).toBeNull();
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should return a 400 if account type is absent", (done) => {

            let data = {
                name: "One Drive Test Account"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                })
                .end((error) => {
                    if(error) {
                        done(error);
                    }
                    Account.findByOwner(user._id)
                        .then((account) => {
                            expect(account.length).toBe(1);
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should return a 400 if account type is invalid", (done) => {

            let data = {
                name: "One Drive Test Account",
                type: "INVALID_TYPE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                })
                .end((error) => {
                    if(error) {
                        done(error);
                    }
                    Account.findByOwner(user._id)
                        .then((account) => {
                            expect(account.length).toBe(1);
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should return a 409 if account name already exists", (done) => {

            let data = {
                name: "Test Account",
                type: "ONE_DRIVE"
            };

            let user = seed.getUser();

            request(app).post("/account")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(409)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("DuplicateEntryError");
                })
                .end((error) => {
                    if(error) {
                        done(error);
                    }
                    Account.findByType("ONE_DRIVE", user._id)
                        .then((account) => {
                            expect(account.length).toBe(0);
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

    });

});