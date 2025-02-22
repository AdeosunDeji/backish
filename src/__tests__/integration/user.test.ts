import supertest from "supertest";
import app from "../../app";
import {
  userFour,
  userOne,
  userThree,
  userTwo,
} from "../fixtures/user.fixture";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Helper from "../../utils/helpers";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";

const api = supertest(app);
let userDetails: any;

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe(" POST api/user/signup", () => {
  test("Should register a user when the body is correct", async () => {
    const payload = userOne;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.CREATED);
    userDetails = body.data;
    expect(body).toMatchObject({
      success: true,
      message: "User registration successful",
      data: {
        name: payload.name,
        email: payload.email,
        password: Helper.hashPassword(payload.password),
      },
    });
  });
  test("Should return error when email field is not passed", async () => {
    const payload = userTwo;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });

  test("Should return error when name field is not passed", async () => {
    const payload = userThree;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('" name" is required.');
  });

  test("Should return error when  password field is not passed", async () => {
    const payload = userFour;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });
});

describe(" POST api/user/login", () => {
  test("Should login a user when the request body is correct", async () => {
    const payload = {
      email: userDetails.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);

    expect(body.data.isUser.email).toBe(payload.email);
  });

  test("Should return error if email is not correct correct", async () => {
    const payload = {
      email: userThree.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe(messages.USER_LOGIN_ERROR);
  });

  test("Should return error if password is not  correct", async () => {
    const payload = {
      email: userDetails.email,
      password: faker.lorem.word(),
    };
    const url = "/api/user/login";
    const { body, statusCode } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe(messages.INCORRECT_PASSWORD);
  });

  test("Should return error if password field is empty", async () => {
    const payload = {
      email: userDetails.email,
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });

  test("Should return error if email field is empty", async () => {
    const payload = {
      password: faker.lorem.word(),
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});
