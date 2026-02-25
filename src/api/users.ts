import type { Request, Response } from "express";

import { createUser, updateUserProfile } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "src/db/schema.js";
import { getBearerToken, hashPassword, makeJWT, validateJWT } from "../auth.js";
import { config } from "../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashed_password: hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}

export async function handlerUpdateUserProfile(req: Request, res: Response) {
  type parameters = {
    email?: string;
    password?: string;
  };
  const params: parameters = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const updates: {
    email?: string;
    hashed_password?: string;
  } = {};

  if (params.email) {
    updates.email = params.email;
  }

  if (params.password) {
    updates.hashed_password = await hashPassword(params.password);
  }

  if (!params.email && !params.password) {
    throw new BadRequestError("Must provide at least email or password to update");
  }

  const user = await updateUserProfile(userId, updates);

  if (!user) {
    throw new Error("Could not update user");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}