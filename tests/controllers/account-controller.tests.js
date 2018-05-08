require("../../src/controllers/account-controller");

const expect = require("expect");
const request = require("supertest");
const _ = require("lodash");
const {ObjectID} = require("mongodb");

const utils = require("../../src/utils/utils");
const Account = require("../../src/models/account-model");
const seed = require("../seed");

const app = utils.getExpressApp();

beforeEach(seed.addUser);
beforeEach(seed.addAccount);

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
                    if (error) {
                        return done(error);
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
                    if (error) {
                        return done(error);
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
                    if (error) {
                        return done(error);
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
                    if (error) {
                        return done(error);
                    }
                    Account.find({type: "ONE_DRIVE", _owner: user._id})
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
                    if (error) {
                        return done(error);
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

        it("should append a timestamp to the account name if it already exists", (done) => {

            let data = {
                name: "Test Account",
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
                    expect(account.name).not.toBe(data.name);
                    expect(_.startsWith(account.name, data.name)).toBeTruthy();
                    expect(account.type).toBe(data.type);
                    expect(account.createdOn).toBeDefined();
                    expect(account.modifiedOn).toBeNull();
                    expect(account._owner).toBeUndefined();
                    expect(account.key).toBeUndefined();

                    let authurl = response.body.authUrl;
                    expect(authurl).toBeDefined();
                })
                .end((error, response) => {
                    if (error) {
                        return done(error);
                    }
                    Account.findById(response.body.account._id)
                        .then((account) => {
                            expect(account).toBeDefined();
                            expect(account.name).not.toBe(data.name);
                            expect(_.startsWith(account.name, data.name)).toBeTruthy();
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
                    if (error) {
                        return done(error);
                    }
                    Account.find({_owner: user._id})
                        .then((account) => {
                            expect(account.length).toBe(2);
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
                    if (error) {
                        return done(error);
                    }
                    Account.find({_owner: user._id})
                        .then((account) => {
                            expect(account.length).toBe(2);
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

    });

    describe("PATCH /account/:id", () => {

        /*
        * Cannot test the ideal case since the code required for the API call is retrieved from the URl on the browser
        * */

        it("should return 400 if code is absent", (done) => {

            let account = seed.getAccount();
            let user = seed.getUser();
            let data = {};

            request(app).patch(`/account/${account._id.toHexString()}`)
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                })
                .end(done);

        });

        it("should return 404 if account ID is invalid", (done) => {

            let account = seed.getAccount();
            let user = seed.getUser();
            let data = {
                code: "kfkaaks-adlnd-q0qdqnd-qdqnldqc"
            };

            request(app).patch("/account/invalidaccountid")
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(404)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ResourceNotFoundError");
                })
                .end(done);

        });

        it("should return 404 if account does not exist", (done) => {

            let account = seed.getAccount();
            let user = seed.getUser();
            let data = {
                code: "kfkaaks-adlnd-q0qdqnd-qdqnldqc"
            };

            request(app).patch(`/account/${new ObjectID().toHexString()}`)
                .set("x-auth", user.tokens[0].token)
                .send(data)
                .expect(404)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ResourceNotFoundError");
                })
                .end(done);

        });

    });

    describe("GET /accounts", () => {

        it("should retrieve all accounts for the user", (done) => {

            let user = seed.getUser();

            request(app).get("/accounts")
                .set("x-auth", user.tokens[0].token)
                .expect(200)
                .expect((response) => {
                    accounts = response.body;
                    expect(Array.isArray(accounts)).toBeTruthy();
                    expect(accounts.length).toBe(2);
                })
                .end(done);

        });

    });

});