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
                            expect(user).not.toBeNull();
                            expect(user.password).not.toBe(data.password);
                            expect(user.verified).toBeFalsy();
                            expect(user.tokens.length).toBe(2);
                            expect(user.tokens[0]).toMatchObject({
                                access: "auth",
                                token: response.headers["x-auth"]
                            });
                            expect(user.tokens[1].access).toBe("verify");
                            done();
                        })
                        .catch((error) => done(error));
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
                        .catch((error) => done(error));
                });

        });

        it("should return 400 for invalid email", (done) => {

            let data = {
                name: "New Test User",
                email: "invalid.email",
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
                        .catch((error) => done(error));
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

    describe("PUT /user/verify", () => {

        it("should verify the user", (done) => {

            let ogUser = seed.getUser();

            request(app).put("/user/verify")
                .set("x-verify", ogUser.tokens[4].token)
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBeDefined();
                    expect(user.name).toBe(ogUser.name);
                    expect(user.email).toBe(ogUser.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(user.modifiedOn).toBeNull();
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findById(ogUser._id)
                        .then((user) => {
                            expect(user).not.toBeNull();
                            expect(user.verified).toBeTruthy();
                            expect(user.tokens.length).toBe(4);
                            done();
                        })
                        .catch((error) => done(error));
                })

        });

        it("should return a 401 if the verify token is invalid", (done) => {

            request(app).put("/user/verify")
                .set("x-verify", "invalidverificationtoken")
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
                })
                .end(done);

        });

        it("should return a 401 if the auth token is absent", (done) => {

            request(app).put("/user/verify")
                .send()
                .expect(401)
                .expect((response) => {
                    let error = response.body;
                    expect(error.type).toBe("AuthenticationError");
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
                            expect(user.tokens.length).toBe(6);
                            expect(user.tokens[5]).toMatchObject({
                                access: "auth",
                                token: response.headers["x-auth"]
                            });
                            done();
                        })
                        .catch((error) => done(error));
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
                            expect(user.tokens.length).toBe(5);
                            done();
                        })
                        .catch((error) => done(error));
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
                    expect(response.headers["x-auth"]).toBeDefined();
                    expect(response.headers["x-auth"]).not.toBe(oldUser.tokens[0].token);
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, newDetails.password)
                        .then((user) => {
                            expect(user).not.toBeNull();
                            expect(user.name).toBe(newDetails.name);
                            expect(user.tokens.length).toBe(4);
                            expect(user.tokens[3]).toMatchObject({
                                token: response.headers["x-auth"],
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => done(error));
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
                            expect(user).not.toBeNull();
                            expect(user.name).toBe(newDetails.name);
                            expect(user.tokens.length).toBe(5);
                            expect(user.tokens[0]).toMatchObject({
                                token: oldUser.tokens[0].token,
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => done(error));
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
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, oldUser.password)
                        .then((user) => {
                            expect(user).not.toBeNull();
                            expect(user.name).toBe(oldUser.name);
                            expect(user.tokens.length).toBe(5);
                            done();
                        })
                        .catch((error) => done(error));
                });

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
                            expect(user).not.toBeNull();
                            expect(user.name).toBe(oldUser.name);
                            expect(user.tokens.length).toBe(5);
                            done();
                        })
                        .catch((error) => done(error));
                });

        })

    });

    describe("DELETE /user/logout", () => {

        it("should delete the sent token", (done) => {

            let user = seed.getUser();

            request(app).delete("/user/logout")
                .set("x-auth", user.tokens[0].token)
                .expect(204)
                .expect((response) => {
                    expect(response.body).toEqual({});
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findById(user._id)
                        .then((userRes) => {
                            expect(userRes.tokens.length).toBe(4);
                            expect(userRes.tokens[0]).not.toMatchObject({
                                token: user.tokens[0].token,
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

    });

    describe("DELETE /user/logout/all", () => {

        it("should delete all tokens for the user", (done) => {

            let user = seed.getUser();

            request(app).delete("/user/logout/all")
                .set("x-auth", user.tokens[0].token)
                .expect(204)
                .expect((response) => {
                    expect(response.body).toEqual({});
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findById(user._id)
                        .then((user) => {
                            expect(user.tokens.length).toBe(3);
                            expect(user.tokens[0]).not.toMatchObject({
                                token: user.tokens[0].token,
                                access: "auth"
                            });
                            expect(user.tokens[1]).not.toMatchObject({
                                token: user.tokens[1].token,
                                access: "auth"
                            });
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

    });

    describe("POST /user/password/reset/init", () => {

        it("should generate a temp token", (done) => {

            let user = seed.getUser();
            let input = {
                email: user.email
            };

            request(app).post("/user/password/reset/init")
                .send(input)
                .expect(202)
                .expect((response) => {
                    expect(response.body).toEqual({});
                })
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findById(user._id)
                        .then((user) => {
                            expect(user.tokens.length).toBe(6);
                            expect(user.tokens[5].access).toBe("temp");
                            done();
                        })
                        .catch((error) => done(error));
                });
        });

        it("should return 400 status if email is missing", (done) => {

            request(app).post("/user/password/reset/init")
                .send()
                .expect(400)
                .expect((response) => {
                    expect(response.body.type).toBe("ValidationError");
                })
                .end(done);

        });

        it("should return 404 status if user with the sent email does not exist", (done) => {

            let input = {
                email: "doesnotexist@test.com"
            };

            request(app).post("/user/password/reset/init")
                .send(input)
                .expect(404)
                .expect((response) => {
                    expect(response.body.type).toBe("ResourceNotFoundError");
                })
                .end(done);

        });

    });

    describe("GET /user/password/reset/token", () => {

        it("should return a reset token", (done) => {

            let user = seed.getUser();

            request(app).get("/user/password/reset/token")
                .set("x-code", user.tokens[2].token)
                .expect(200)
                .expect((response) => {
                    expect(response.headers["x-reset"]).toBeDefined();
                    expect(response.body).toEqual({});
                })
                .end((error, response) =>{
                    if(error) {
                        return done(error);
                    }
                    User.findById(user._id)
                        .then((user) => {
                            expect(user.tokens.length).toBe(5);
                            expect(user.tokens[2].access).not.toBe("temp");
                            expect(user.tokens[4]).toMatchObject({
                                token: response.headers["x-reset"],
                                access: "reset"
                            });
                            done();
                        })
                        .catch((error) => done(error));
                })

        });

        it("should return a 401 status if temp token is invalid", (done) => {

            request(app).get("/user/password/reset/token")
                .set("x-code", "Invalid temp token")
                .expect(401)
                .expect((response) => {
                    expect(response.body.type).toBe("AuthenticationError");
                })
                .end(done);
        });

        it("should return a 401 status if temp token is not present", (done) => {

            request(app).get("/user/password/reset/token")
                .send()
                .expect(401)
                .expect((response) => {
                    expect(response.body.type).toBe("AuthenticationError");
                })
                .end(done);
        });

    });

    describe("PUT /user/password/reset", () => {

        it("should update the password", (done) => {

            let oldUser = seed.getUser();

            request(app).put("/user/password/reset")
                .send({password: "changedpassword"})
                .set("x-reset", oldUser.tokens[3].token)
                .expect(200)
                .expect((response) => {
                    let user = response.body;
                    expect(user._id).toBe(oldUser._id.toHexString());
                    expect(user.name).toBe(oldUser.name);
                    expect(user.email).toBe(oldUser.email);
                    expect(typeof user.createdOn).toBe("number");
                    expect(typeof user.modifiedOn).toBe("number");
                    expect(user.password).toBeUndefined();
                    expect(user.tokens).toBeUndefined();
                    expect(response.headers["x-auth"]).toBeDefined();
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(oldUser.email, "changedpassword")
                        .then((user) => {
                            expect(user).not.toBeNull();
                            expect(user.tokens.length).toBe(1);
                            expect(user.tokens[0]).toMatchObject({
                                token: response.headers["x-auth"],
                                access: "auth"
                            });
                            expect(user.password).not.toBe("changedpassword");
                            done();
                        })
                        .catch((error) => done(error));
                })

        });

        it("should return 400 status for absent password field", (done) => {

            let user = seed.getUser();

            request(app).put("/user/password/reset")
                .set("x-reset", user.tokens[3].token)
                .expect(400)
                .expect((response) => {
                    expect(response.body.type).toBe("ValidationError");
                })
                .end((error, response) => {
                    if(error) {
                        return done(error);
                    }
                    User.findByCredentials(user.email, user.password)
                        .then((user) => {
                            expect(user).not.toBeNull();
                            expect(user.tokens.length).toBe(5);
                            expect(user.password).toBeDefined();
                            done();
                        })
                        .catch((error) => done(error));
                });

        });

        it("should return 401 status for invalid reset token", (done) => {

            request(app).put("/user/password/reset")
                .send({password: "changedpassword"})
                .set("x-reset", "invalidresettoken")
                .expect(401)
                .expect((response) => {
                    expect(response.body.type).toBe("AuthenticationError");
                })
                .end(done);

        });

        it("should return 401 status for absent reset token", (done) => {

            request(app).put("/user/password/reset")
                .send({password: "changedpassword"})
                .expect(401)
                .expect((response) => {
                    expect(response.body.type).toBe("AuthenticationError");
                })
                .end(done);

        });

    });

});