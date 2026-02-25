import type { Request, Response } from "express";

import { createUser, getUserById, updateRedChirpy, updateUserProfile } from "../db/queries/users.js";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { NewUser } from "src/db/schema.js";
import { getAPIKey, getBearerToken, hashPassword, makeJWT, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { verifyChirp } from "./chirps.js";

export type UserResponse = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isChirpyRed: boolean;
};

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
    isChirpyRed: user.is_chirpy_red
  });
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
    isChirpyRed: user.is_chirpy_red
  });
}

export async function handlerUpdaterRedChirpy(req: Request, res: Response) {
  try {
    const apiKey = getAPIKey(req);
    if (config.api.PolkaKey !== apiKey) {
      throw new UserNotAuthenticatedError("Invalid API key");
    }
  } catch (error) {
    throw new UserNotAuthenticatedError("Invalid API key");
  }

  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };
  const params: parameters = req.body;

  if (!params || !params.event) {
    res.status(204).send();
    return;
  }

  if (!params.data || !params.data.userId) {
    res.status(204).send();
    return;
  }

  const userId = params.data.userId;

  if (params.event === "user.upgraded") {
    const user = await getUserById(userId);
    if (user) {
      await updateRedChirpy(userId);
    }
  }

  res.status(204).send();
}