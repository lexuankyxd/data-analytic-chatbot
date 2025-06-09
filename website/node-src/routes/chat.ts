import { Request, Response } from "express";
import { ChatMessage, RequestWithEmail } from "../types/types";

const { protect } = require("../middleware/auth")
export const chatRoutes = require('express').Router();
const { upload } = require("../storage")
const fs = require("fs")
const net = require("net")
const { RequestWithEmail } = require("../types/types")
import { SocketServer } from "../socket";
import { createThread, getAllThread } from "../internal-database/sqlite_db";
const progress_map = new Map<string, number>();
import { emailSessionMap } from "../websocket_chat";
const server = new SocketServer("MCP Server", process.env.PROGRESS_SOCKET_PATH!, (message: string) => {
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
      server.sendMessage(`${process.env.FILE_SAVE_PATH}/` + files[i].filename)
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
  const tmp = { message: progress_map.get(`${process.env.FILE_SAVE_PATH}/` + req.body.file) };
  if (tmp.message == 100) progress_map.delete(`${process.env.FILE_SAVE_PATH}/` + req.body.file)
  return res.json(tmp)
})

chatRoutes.get("/createThread", protect, async (req: RequestWithEmail, res: Response) => {
  emailSessionMap.get(req.user_email)!.createThread();
  return res.json({ message: "New thread created" });
})

chatRoutes.get("/getThreads", protect, async (req: RequestWithEmail, res: Response) => {
  const ids = await getAllThread(req.user_email)
  return res.json(ids);
})

chatRoutes.get("/getThread", protect, async (req: RequestWithEmail, res: Response) => {
  const user = emailSessionMap.get(req.user_email)!;
  await user.loadThread(req.query.thread_id as string);
  const thread = user.getThread();
  const messages: { message: ChatMessage, type: string }[] = [];
  thread?.history.map((message, i) => {
    messages.push({ message, type: thread?.types[i] })
  })
  console.log(messages);
  return res.json({ thread_id: thread?.thread_id, message: messages });
})

chatRoutes.get("/saveThread", protect, (req: RequestWithEmail, res: Response) => {
  const user = emailSessionMap.get(req.user_email);
  user?.saveMessages();
  return res.json({ message: "Saved" });
})
