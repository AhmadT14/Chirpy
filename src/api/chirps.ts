import { Request, Response, NextFunction } from "express";
import { createChirp, deleteChirpById, getChirpById, getChirpsByUserId, getChirps } from "../db/queries/chirps.js";
import { handlerChirpsValidate} from "./validate_chirp.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import { NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors.js";


export async function createChirpHandler(req: Request, res: Response,next:NextFunction) {
    
    try {
      const chirp = req.body;
    const userId = await verifyChirp(req);
        await handlerChirpsValidate(chirp);
        const result = await createChirp({ body: chirp.body, user_id: userId });
        const response = {
            id: result.id,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            body: result.body,
            userId: result.user_id
        };
        res.status(201).send(response);
      } catch (err) {
        next(err);
      }
}

export async function getChirpsHandler(req: Request, res: Response,next:NextFunction) {
  type Params={
    authorId?:string
      }
    try {
      const params:Params={authorId: typeof req.query.authorId === "string" ? req.query.authorId : undefined}
      if(params.authorId && (typeof params.authorId === "string"))
      {
        const result=await getChirpsByUserId(params.authorId);
        res.status(200).send(result);
      }
      else{const rows = await getChirps();
        res.status(200).send(rows);}
    
      } catch (err) {
        next(err);
      }
}

export async function getChirpByIdHandler(req: Request, res: Response,next:NextFunction) {
    try {
        const chirpId = Array.isArray(req.params.chirpId) ? req.params.chirpId[0] : req.params.chirpId;
        const chirp = await getChirpById(chirpId);
        if (!chirp) {
          throw new NotFoundError("Chirp not found");
        }
        res.status(200).send(chirp);
      } catch (err) {
        next(err);
      }
}

export async function verifyChirp(req:Request): Promise<string>{
  const token = getBearerToken(req);
  const userId=validateJWT(token, config.jwt.secret);
  if(!userId)
  {
    throw new UserNotAuthenticatedError("Invalid or expired token")
  }
  return userId;
}

export async function handlerdeleteChirp(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await verifyChirp(req);
    const chirpId = Array.isArray(req.params.chirpId)
      ? req.params.chirpId[0]
      : req.params.chirpId;

    const chirp = await getChirpById(chirpId);
    if (!chirp) {
      throw new NotFoundError("Chirp not found");
    }

    if (chirp.user_id !== userId) {
      throw new UserForbiddenError("Not allowed to delete this chirp");
    }

    await deleteChirpById(chirpId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
