import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { env } from "./src/config/env.js";
import { rootDir } from "./src/config/paths.js";
import "./src/config/db.js"; // garante que o banco e as tabelas existam antes de tudo

import { authRouter } from "./src/routes/auth.routes.js";
import { conversationsRouter } from "./src/routes/conversations.routes.js";
import { uploadRouter } from "./src/routes/upload.routes.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";

const app = express();

// O CORS só é necessário se o Front-End for aberto por outra origem
// (ex: extensão Live Server). Servindo o Front-End pelo próprio Express
// (abaixo), tudo roda na mesma origem e os cookies de sessão funcionam
// sem nenhuma configuração extra.
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Servidor online" });
});

app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/upload", uploadRouter);

// ===== Front-End =====
const frontEndDir = path.join(rootDir, "..", "Front-End");
app.use(express.static(frontEndDir));

app.use("/api", notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`✅ Servidor rodando em http://localhost:${env.port}`);
});
