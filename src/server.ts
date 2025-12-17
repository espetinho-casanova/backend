import express from "express";
import "express-async-errors";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

import { env } from "./config/env";
import { router } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const tmpDir = path.resolve(__dirname, "..", "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const app = express();
app.use(express.json());

const corsOrigin = env.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = new Set(corsOrigin.split(',').map(origin => origin.trim()));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== 'production') {
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLocalIP = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin);
        if (isLocalhost || isLocalIP) {
          return callback(null, true);
        }
      }

      callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true,
  })
);

app.use(router);
app.use("/files", express.static(path.resolve(__dirname, "..", "tmp")));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] listening on port ${PORT}`);
});
