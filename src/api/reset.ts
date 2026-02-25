import { Request, Response, NextFunction } from 'express';
import { config } from "../config.js";
import { deletUsers } from '../db/queries/users.js';

export async function reset(req: Request, res: Response) {
    if(config.api.platform!=="dev")
    {
        res.status(403).send()
        return;
    }
await deletUsers()
config.api.fileServerHits = 0;
res.status(200).json({ Hits: config.api.fileServerHits });
}