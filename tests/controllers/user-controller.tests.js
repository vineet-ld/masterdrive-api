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
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: data.email})
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.password).not.toBe(data.password);
                            expect(user.tokens.length).toBe(1);
                            done();
                        })
                        .catch((error) => {
                            done(error);
                        })
                })

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
                })

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
                })

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
                .end((error) => {
                    if(error) {
                        return done(error);
                    }
                    User.findOne({email: "test.user@test.com"})
                        .then((user) => {
                            expect(user).toBeDefined();
                            expect(user.tokens.length).toBe(2);
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

        })

    });

});