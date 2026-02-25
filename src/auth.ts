import * as argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { randomBytes } from "crypto";
import { UserNotAuthenticatedError } from "./api/errors.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;



export function hashPassword(password: string): Promise<string>{
    return argon2.hash(password)
}
export function checkPasswordHash(password: string, hash: string): Promise<boolean>{
    return argon2.verify(hash, password)
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string{
    const chirpyPayload={
    iss:"chirpy",
    sub:userID,
    iat:Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn,
}
    return jwt.sign(chirpyPayload, secret)
}

export function validateJWT(tokenString: string, secret: string): string{
    try {
        const verification = jwt.verify(tokenString, secret).sub as string
        return verification
    } catch (err) {
        throw new UserNotAuthenticatedError("Invalid or expired token")
    }
}

export function getBearerToken(req: Request): string{
    const authHeader = req.get("authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Authorization header missing");
    }
    if (!authHeader.startsWith("Bearer ")) {
        throw new UserNotAuthenticatedError("Invalid authorization header format");
    }
    return authHeader.substring(7);
}

export function makeRefreshToken(): string{
    return randomBytes(32).toString("hex");
}