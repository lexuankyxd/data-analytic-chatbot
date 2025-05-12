import { Request, Response } from "express";

const { protect } = require("../middleware/auth")
export const chatRoutes = require('express').Router();
const { upload } = require("../storage")
const fs = require("fs")
const net = require("net")

try { fs.unlinkSync(process.env.PROGRESS_SOCKET_PATH as string); } catch (e) { console.log(e) }
var CLIENT: any = null

const progress_map = new Map<string, number>();

const server = net.createServer((client: any) => {
  CLIENT = client
  let dataBuffer = '';
  console.log("MCP Server progress update connected")
  client.setEncoding('utf8');

  client.on('data', (chunk: any) => {
    dataBuffer += chunk;
    if (dataBuffer.endsWith('\r\n')) {
      const message = JSON.parse(dataBuffer);
      progress_map.set(message.file, message.progress)
      dataBuffer = '';
    }
  });
  client.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.PROGRESS_SOCKET_PATH, () => {
});

chatRoutes.post("/upload", protect, upload.array('files'), (req: Request, res: Response) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }
  const files = req.files as Express.Multer.File[]
  const file_id: string[] = []
  for (var i: number = 0; i < files.length; i++) {
    file_id.push(files[i].filename)
  }
  res.json({ file_id: file_id })
})

chatRoutes.get("/progress", protect, (req: any, res: Response) => {
  if (!req.body.file) {
    return res.status(400).send("No file name");
  }
  const email = req.body.file.split("-")[0];
  if (email != req.user_email)
    res.json({ message: "Invalid access to file" })
  const tmp = { message: progress_map.get("/home/g0dz/projects/da-llm/files/" + req.body.file) };
  if (tmp.message == 100) progress_map.delete("/home/g0dz/projects/da-llm/files/" + req.body.file)
  return res.json(tmp)
})
