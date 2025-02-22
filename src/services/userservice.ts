import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { Iuser } from "../types/user";
import { AppError } from "../utils/errors";
import Helper from "../utils/helpers";
import messages from "../utils/messages";

const registerUser = async (input: Iuser) => {
  const isUser = await userquery.findUserByEmail(input.email);
  if (isUser)
    throw new AppError({
      httpCode: httpStatus.FOUND,
      description: messages.USER_ALREADY_EXIST,
    });
  const hash = await Helper.hashPassword(input.password);
  const user = await userquery.createUser({
    name: input.name,
    email: input.email,
    password: hash,
  });
  if (!user)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.USER_CREATION_ERROR,
    });
  return user;
};

const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const isUser = await userquery.findUserByEmail(email);
  if (!isUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_LOGIN_ERROR,
    });
  const isPassword = await Helper.comparePassword(isUser.password, password);
  if (!isPassword)
    throw new AppError({
      httpCode: httpStatus.BAD_REQUEST,
      description: messages.INCORRECT_PASSWORD,
    });
  const token = Helper.generateToken({ id: isUser.id, email: isUser.email });
  const result = { isUser, token };
  return result;
};

export default {
  registerUser,
  loginUser,
};
