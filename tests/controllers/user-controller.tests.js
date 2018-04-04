require("./../../controllers/user-controller");

const expect = require("expect");
const request = require("supertest");

const utils = require("./../../utils/utils");
const User = require("./../../models/user-model");
const seed = require("../seed");

const app = utils.getExpressApp();

beforeEach(seed.clearUsers);

describe("User Controller", () => {

    describe("POST /user", () => {

        it("should create a new user", (done) => {

            let data = {
                name: "Test User",
                email: "test.user@test.com",
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
                name: "Test User",
                email: "test.user@test.com"
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
                name: "Test User",
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

            seed.addUser(data);

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

    })

});