import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { handlerMetrics } from "./api/metrics.js";
import { reset } from "./api/reset.js";
import {
  middlewareLogResponse,
  middlewareMetricsInc,
  errorMiddleWare,
} from "./api/middleware.js";
import {
  createChirpHandler,
  getChirpsHandler,
  getChirpByIdHandler,
  handlerdeleteChirp,
} from "./api/chirps.js";
import { config } from "./config.js";
import { handlerUpdateUserProfile, handlerUsersCreate } from "./api/users.js";
import { handlerLogin, handlerRefresh, handlerRevoke } from "./api/auth.js";
import { handlerReadiness } from "./api/readiness.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(reset(req, res)).catch(next);
});

app.post("/api/login", (req, res, next) => {
  Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(handlerRevoke(req, res)).catch(next);
});

app.post("/api/users", (req, res, next) => {
  Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});

app.put("/api/users", (req, res, next) => {
  Promise.resolve(handlerUpdateUserProfile(req, res)).catch(next);
});

app.delete("/api/chirps/:chirpId", (req, res, next) => {
  Promise.resolve(handlerdeleteChirp(req, res, next)).catch(next);
});

app.post("/api/chirps", createChirpHandler);
app.get("/api/chirps", getChirpsHandler);
app.get("/api/chirps/:chirpId",getChirpByIdHandler);

app.use(errorMiddleWare);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});
