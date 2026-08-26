import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { uploadFile } from "../controllers/upload.controller.js";
import { uploadsDir } from "../config/paths.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, upload.single("file"), uploadFile);
