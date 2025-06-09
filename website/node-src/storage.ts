import { Request } from "express";
import { RequestWithEmail } from "./types/types";
const path = require('path');
const multer = require("multer")

const allowedExtensions = [".pdf"]

export const upload = multer({
  storage: multer.diskStorage({
    destination: process.env.FILE_SAVE_PATH,
    filename: (req: RequestWithEmail, file: any, cb: any) => {
      cb(null, req.user_email + "-" + file.originalname.split("-").join("") + '-' + Date.now() + path.extname(file.originalname));
    },
  }),

  fileFilter: (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed: ' + allowedExtensions.join(', ')));
    }
  }
}).array('files')
