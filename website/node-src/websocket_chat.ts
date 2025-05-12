import WebSocket from 'ws';
import url from 'url';
const { assert } = require("assert")
const net = require('net');
const wss = new WebSocket.Server({ port: 3001 });
const { verifyAccessToken } = require('./middleware/auth');
const { lookUpHash } = require("./routes/account")
import { spawn } from 'child_process';
import fs from 'fs';

try { fs.unlinkSync(process.env.MESSAGE_SOCKET_PATH as string); } catch (e) { }

var CLIENT: any = null

const server = net.createServer((client: any) => {
  CLIENT = client
  let dataBuffer = '';
  console.log("MCP Client Connected")
  client.setEncoding('utf8');

  // var i = 0;
  // setInterval(() => {
  //   i++
  //   client.write(JSON.stringify({ user: "demo", message: "Message " + i }) + "\n")
  // }, 1000)
  client.on('data', (chunk: any) => {
    dataBuffer += chunk;
    if (dataBuffer.endsWith('\r\n')) {
      const message = JSON.parse(dataBuffer);
      emailWSMap.get(message.user)?.send(message.type + ":" + message.message)
      dataBuffer = '';
    }
  });
  client.on('end', () => {
    console.log('Client disconnected');
  });
});


type ChatMessage = {
  sender: "USER" | "ASSITANT";
  content: string;
}

type UserSession = {
  email: string | undefined;
  history: ChatMessage[];
}

interface WebSocketWithSessionInfo extends WebSocket {
  userSession: UserSession;
}
const emailWSMap = new Map<string, WebSocketWithSessionInfo>();


server.listen(process.env.MESSAGE_SOCKET_PATH, () => {
});

wss.on('connection', (ws: WebSocketWithSessionInfo, req: Request) => {
  // verify user with access token, attach decoded email from token to ws object
  const parsedUrl = url.parse(req.url, true);
  var token = url.parse(req.url, true).query.token;
  if (!token) {
    ws.send("ERR:Missing access token");
    ws.close();
  }
  token = verifyAccessToken(token);
  if (token == "INVALID TOKEN") {
    ws.send("ERR:Invalid access token");
    ws.close();
  }
  ws.userSession = { email: token as string, history: [] };
  emailWSMap.set(token as string, ws);
  ws.on('message', (message: string) => {
    ws.userSession.history.push({ sender: "USER", content: message });
    console.log(JSON.stringify({ user: token, message }))
    CLIENT.write(JSON.stringify({ user: token, message }) + "\n")
  });
  ws.on('close', () => {

  });
});
