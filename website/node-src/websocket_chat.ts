import WebSocket from 'ws';
import url from 'url';
import assert from 'assert';
const wss = new WebSocket.Server({ port: 8080 });
const { verifyAccessToken } = require('./middleware/auth');
const { lookUpHash } = require("./routes/account")
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

wss.on('connection', (ws: WebSocketWithSessionInfo, req: Request) => {
  // verify user with access token, attach decoded email from token to ws object
  const parsedUrl = url.parse(req.url, true);
  var token = url.parse(req.url, true).query.token;
  if (!token) {
    ws.send("Missing access token");
    ws.close();
  }
  token = verifyAccessToken(token);
  if (token == "INVALID TOKEN") {
    ws.send("Invalid access token");
    ws.close();
  }
  assert(typeof token === 'string');
  ws.userSession = { email: token, history: [] };
  ws.on('message', (message: string) => {
    ws.userSession.history.push({ sender: "USER", content: message });
    const res = `"${message}" from ${ws.userSession.email}`
    ws.send(res);
    // TODO implement sending message to LLM
  });
  ws.on('close', () => {

  });
});
