import fs from "fs";
import path from "path";
import multer from "multer";
import { randomBytes } from "crypto";

const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads", "audio");

export function ensureUploadDir(): void {
  if (!fs.existsSync(uploadRoot)) {
    fs.mkdirSync(uploadRoot, { recursive: true });
  }
}

export const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, uploadRoot);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".webm";
      const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /^audio\//.test(file.mimetype) ||
      /^video\/webm/i.test(file.mimetype) ||
      file.mimetype === "application/octet-stream" ||
      /\.(webm|mp3|wav|m4a|ogg)$/i.test(file.originalname);
    if (ok) cb(null, true);
    else cb(new Error("Only audio uploads are allowed"));
  },
});

export function safeUnlink(filePath: string | undefined): void {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    /* ignore */
  }
}
