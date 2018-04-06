require("./../../controllers/user-controller");

const expect = require("expect");
const request = require("supertest");

const utils = require("./../../utils/utils");
const User = require("./../../models/user-model");
const seed = require("../seed");

const app = utils.getExpressApp();

beforeEach(seed.addUser);
afterEach(seed.clearUsers);

describe("User Controller", () => {

    describe("POST /user", () => {

        it("should create a new user", (done) => {

            let data = {
                name: "New Test User",
                email: "newtest.user@test.com",
                password: "123456"
            };

            request(app).post("/user")
                .send(data)
                .expect(201)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBeDefined();
                    expect(user.name).toBe(data.name);
                    expect(user.email).toBe(data.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(user.modifiedOn).toBeNull();
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                    expect(response.headers["x-auth"]).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: data.email})
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.password).not.toBe(data.password);
                            expect(user.tokens.length).toBe(1);
                            expect(user.tokens[0]).toMatchObject({
                                access: "auth",
                                token: response.headers["x-auth"]
                            });
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        });
                });

        });

        it("should return 400 for missing password", (done) => {

            let data = {
                name: "New Test User",
                email: "newtest.user@test.com"
            };

            request(app).post("/user")
                .send(data)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                    expect(error.status).toBe(400);
                    expect(error.messages).toBeDefined();
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: data.email})
                        .then((user) => {
                            expect(user).toBeNull();
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        })
                });

        });

        it("should return 400 for invalid email", (done) => {

            let data = {
                name: "New Test User",
                email: "inavlid.email",
                password: "123456"
            };

            request(app).post("/user")
                .send(data)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                    expect(error.status).toBe(400);
                    expect(error.messages).toBeDefined();
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: data.email})
                        .then((user) => {
                            expect(user).toBeNull();
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        })
                });

        });

        it("should return 409 for duplicate email", (done) => {

            let data = {
                name: "Test User",
                email: "test.user@test.com",
                password: "123456"
            };

            request(app).post("/user")
                .send(data)
                .expect(409)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("DuplicateEntryError");
                    expect(error.status).toBe(409);
                    expect(error.messages).toBeDefined();
                })
                .end(done);

        });

    });

    describe("POST /user/login", () => {

        it("should sign in a user", (done) => {

            request(app).post("/user/login")
                .send({
                    email: "test.user@test.com",
                    password: "123456"
                })
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBeDefined();
                    expect(user.name).toBeDefined();
                    expect(user.email).toBe("test.user@test.com");
                    expect(typeof user.createdOn).toBe("number");
                    expect(user.modifiedOn).toBeNull();
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                    expect(response.headers["x-auth"]).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: "test.user@test.com"})
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.tokens.length).toBe(2);
                            expect(user.tokens[1]).toMatchObject({
                                access: "auth",
                                token: response.headers["x-auth"]
                            });
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        });
                });

        });

        it("should not sign in a user if credentials are wrong", (done) => {

            request(app).post("/user/login")
                .send({
                    email: "test.user@test.com",
                    password: "wrongpassword"
                })
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
                    expect(response.headers["x-auth"]).toBeUndefined();
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: "test.user@test.com"})
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.tokens.length).toBe(1);
                            done();
                        })
                });

        });

        it("should return 400 if email not present", (done) => {

            request(app).post("/user/login")
                .send({
                    password: "wrongpassword"
                })
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                    expect(response.headers["x-auth"]).toBeUndefined();
                })
                .end(done);

        });

    });

    describe("GET /user/me", () => {

        it("should return the logged in user", (done) => {

            let userObj = seed.getUser();

            request(app).get("/user/me")
                .set("x-auth", userObj.tokens[0].token)
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBe(userObj._id.toHexString());
                    expect(user.name).toBe(userObj.name);
                    expect(user.email).toBe(userObj.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(user.modifiedOn).toBeNull();
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                })
                .end(done);

        });

        it("should return a 401 if the auth token is invalid", (done) => {

            request(app).get("/user/me")
                .set("x-auth", "invalidauthtoken")
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
                })
                .end(done);

        });

        it("should return a 401 if the auth token is absent", (done) => {

            request(app).get("/user/me")
                .send()
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
                })
                .end(done);

        });

    });

    describe("PUT /user", () => {

        it("should update name and password of the user", (done) => {

            let newDetails = {
                name: "Changed name",
                password: "New Password"
            };

            let oldUser = seed.getUser();

            request(app).put("/user")
                .send(newDetails)
                .set("x-auth", oldUser.tokens[0].token)
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBe(oldUser._id.toHexString());
                    expect(user.name).toBe(newDetails.name);
                    expect(user.email).toBe(oldUser.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(typeof user.modifiedOn).toBe("number");
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                    expect(response.headers["x-auth"]).not.toBe(oldUser.tokens[0].token);
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, newDetails.password)
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.name).toBe(newDetails.name);
                            expect(user.tokens.length).toBe(1);
                            expect(user.tokens[0]).toMatchObject({
                                token: response.headers["x-auth"],
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        });
                });

        });

        it("should update name and return same auth token", (done) => {

            let newDetails = {
                name: "Changed name"
            };

            let oldUser = seed.getUser();

            request(app).put("/user")
                .send(newDetails)
                .set("x-auth", oldUser.tokens[0].token)
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBe(oldUser._id.toHexString());
                    expect(user.name).toBe(newDetails.name);
                    expect(user.email).toBe(oldUser.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(typeof user.modifiedOn).toBe("number");
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                    expect(response.headers["x-auth"]).toBe(oldUser.tokens[0].token);
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, oldUser.password)
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.name).toBe(newDetails.name);
                            expect(user.tokens.length).toBe(1);
                            expect(user.tokens[0]).toMatchObject({
                                token: oldUser.tokens[0].token,
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        });
                });

        });

        it("should return 304 if unmodified parameter values are sent", (done) => {

            let oldUser = seed.getUser();

            let newDetails = {
                name: oldUser.name
            };

            request(app).put("/user")
                .send(newDetails)
                .set("x-auth", oldUser.tokens[0].token)
                .expect(304)
                .expect((response) => {
                    expect(response.body).toEqual({});
                })
                .end(done);

        });

        it("should return 400 when name and password are absent", (done) => {

            request(app).put("/user")
                .set("x-auth", seed.getUser().tokens[0].token)
                .expect(400)
                .expect((response) => {
                    expect(response.body.type).toBe("ValidationError");
                })
                .end(done);

        });

        it("should return 400 if name is longer than 25 characters", (done) => {

            let newDetails = {
                name: "Name which is more than twenty five characters long",
                password: "New Password"
            };

            let oldUser = seed.getUser();

            request(app).put("/user")
                .send(newDetails)
                .set("x-auth", seed.getUser().tokens[0].token)
                .expect(400)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("ValidationError");
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, oldUser.password)
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.name).toBe(oldUser.name);
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        });
                });

        })

    });

});