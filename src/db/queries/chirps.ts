import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, desc, eq, sql } from "drizzle-orm";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getChirps(sort: "asc" | "desc" = "desc") {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(sort === "asc" ? asc(chirps.createdAt) : sql`${chirps.createdAt} DESC`);
  return result;
}


export async function getChirpById(id: string,sort:"asc"|"desc"="asc") {
  const [result] = await db.
    select().from(chirps).where(eq(chirps.id,id)).orderBy(sql`${chirps.createdAt} ${sort}`);
    return result
}

export async function deleteChirpById(id: string,) {
  const [result] = await db.
    delete(chirps).where(eq(chirps.id,id));
    return result
}

export async function getChirpsByUserId(id: string, sort: "asc" | "desc" = "asc") {
  const result = await db
    .select()
    .from(chirps)
    .where(eq(chirps.user_id, id))
    .orderBy(sort === "asc" ? asc(chirps.createdAt) : desc(chirps.createdAt));
  return result;
}

