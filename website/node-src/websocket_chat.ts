import url from 'url';
const { verifyAccessToken } = require('./middleware/auth');
const { lookUpHash } = require("./routes/account")
import { spawn } from 'child_process';
import { createThread } from './internal-database/sqlite_db';
import WebSocket from 'ws';
import { SocketServer } from './socket';
import { ChatMessage, UserSession } from './types/types'
import { logMessage } from './utilities/logger';

const server = new SocketServer("MCP Client", process.env.MESSAGE_SOCKET_PATH!, async (message: string) => {
  const obj = JSON.parse(message);
  await emailSessionMap.get(obj.user)?.addMessage(obj.message, obj.type)
  emailSessionMap.get(obj.user)?.sendMessage(JSON.stringify(obj))
});

export const emailSessionMap = new Map<string, UserSession>();

const wss = new WebSocket.Server({ port: 3001 })

wss.on('connection', (ws: WebSocket, req: Request) => {
  // verify user with access token, attach decoded email from token to ws object
  const parsedUrl = url.parse(req.url, true);
  var token = url.parse(req.url, true).query.token;

  if (!token) {
    ws.send(JSON.stringify({ type: "EER", message: "No token found" }));
    ws.close();
  }

  const decoded = verifyAccessToken(token);

  if (decoded == "INVALID TOKEN") {
    ws.send(JSON.stringify({ type: "EER", message: "Invalid access token" }));
    ws.close();
  }

  const userSession = new UserSession(decoded.id, decoded.email, ws);
  emailSessionMap.set(decoded.email, userSession);

  ws.on('message', async (message: string) => {
    const data = JSON.parse(message)
    await userSession.addMessage({ role: "user", content: data.message }, "MSG");
    console.log(userSession.getMessages())
    server.sendMessage(JSON.stringify({ user: decoded.email, message: userSession.getMessages() }))
  });
  ws.on('close', () => {
    userSession.saveMessages();
    // const f = open("/home/g0dz/projects/da-llm/website/node-src/chatlogs/" + ws.userSession.user_id + "_" + ws.userSession.conv_id, "a");

    logMessage("INF", decoded.email + " exited")

  });
});
