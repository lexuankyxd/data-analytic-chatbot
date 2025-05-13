import { BASE_WEBSOCKET_URL } from "./config/config"
export let ws: WebSocket | null = null;

export function connectToWebSocket(): boolean {
  if (ws != null && ws.readyState != ws.CLOSED && ws.readyState != ws.CLOSING)
    return true;
  ws = new WebSocket(BASE_WEBSOCKET_URL + "/chat?token=" + localStorage.getItem("authToken"))
  return ws.readyState == ws.OPEN;
}

export function sendMessageToWebSocket(message: string) {
  ws!.send(message);
}
