import { Request, Response } from "express";
import { RequestWithEmail } from "../types/types";

const { protect } = require("../middleware/auth")
export const chatRoutes = require('express').Router();
const { upload } = require("../storage")
const fs = require("fs")
const net = require("net")
const { RequestWithEmail } = require("../types/types")
import { SocketServer } from "../socket";
const progress_map = new Map<string, number>();

const server = new SocketServer("MCP Server", process.env.PROCESS_SOCKET_PATH!, (message: string) => {
  const obj = JSON.parse(message);
  progress_map.set(obj.file, obj.progress)
})

chatRoutes.post("/upload", protect, (req: RequestWithEmail, res: Response) => {
  upload(req, res, (err: any) => {
    if (err) {
      return res.status(400).send({ error: err.message });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }
    const files = req.files as Express.Multer.File[]
    const file_id: string[] = []
    for (var i: number = 0; i < files.length; i++) {
      server.sendMessage(`${process.env.FILE_SAVE}/` + files[i].filename)
      file_id.push(files[i].filename)
    }
    res.json({ file_id: file_id })
  })
})

chatRoutes.post("/progress", protect, (req: RequestWithEmail, res: Response) => {
  if (!req.body.file) {
    return res.status(400).send("No file name");
  }
  const email = req.body.file.split("-")[0];
  if (email != req.user_email)
    res.json({ message: "Invalid access to file" })
  const tmp = { message: progress_map.get(`${process.env.FILE_SAVE}/` + req.body.file) };
  if (tmp.message == 100) progress_map.delete(`${process.env.FILE_SAVE}/` + req.body.file)
  return res.json(tmp)
})

chatRoutes.get("/getThreads", protect, (req: RequestWithEmail, res: Response) => {
  req.user_email
})

chatRoutes.get("/getThread", protect, (req: RequestWithEmail, res: Response) => {
  req.user_email
})
