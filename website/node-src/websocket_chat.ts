import url from 'url';
const { verifyAccessToken } = require('./middleware/auth');
const { lookUpHash } = require("./routes/account")
import { spawn } from 'child_process';
import { createThread } from './internal-database/sqlite_db';
import WebSocket from 'ws';
import { SocketServer } from './socket';
import { ChatMessage, UserSession, WebSocketWithSessionInfo } from './types/types'
import { logMessage } from './utilities/logger';

const server = new SocketServer("MCP Client", process.env.MESSAGE_SOCKET_PATH!, (message: string) => {
  const obj = JSON.parse(message);
  emailWSMap.get(obj.user)?.userSession.addMessage({ sender: "ASSISTANT", content: obj.content })
  emailWSMap.get(obj.user)?.send(JSON.stringify(obj))
});

const emailWSMap = new Map<string, WebSocketWithSessionInfo>();

const wss = new WebSocket.Server({ port: 3001 })

wss.on('connection', (ws: WebSocketWithSessionInfo, req: Request) => {
  // verify user with access token, attach decoded email from token to ws object
  const parsedUrl = url.parse(req.url, true);
  var token = url.parse(req.url, true).query.token;

  if (!token) {
    ws.send(JSON.stringify({ type: "EER", message: "No token found" }));
    ws.close();
  }

  const decoded = verifyAccessToken(token);

  if (token == "INVALID TOKEN") {
    ws.send(JSON.stringify({ type: "EER", message: "Invalid access token" }));
    ws.close();
  }

  ws.userSession = new UserSession(decoded.email, decoded.id);
  emailWSMap.set(decoded.id, ws);

  ws.on('message', async (message: string) => {
    ws.userSession.addMessage({ sender: "USER", content: message });

    logMessage("INF", JSON.stringify({ user: decoded.id, message }))
    server.sendMessage(JSON.stringify({ user: decoded.id, message }))
  });
  ws.on('close', () => {
    ws.userSession.saveMessages();
    // const f = open("/home/g0dz/projects/da-llm/website/node-src/chatlogs/" + ws.userSession.user_id + "_" + ws.userSession.conv_id, "a");

    logMessage("INF", ws.userSession["email"] + " exited")

  });
});
