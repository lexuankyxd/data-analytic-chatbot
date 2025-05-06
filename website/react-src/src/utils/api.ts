import { BASE_URL, BASE_WEBSOCKET_URL } from "../config/config";

interface AIResponse {
  ai: string;
}
console.log(BASE_WEBSOCKET_URL)
const ws = new WebSocket("ws://" + BASE_WEBSOCKET_URL);



export async function sendMessage(message: string, tables: any[][]): Promise<void> {
  ws.send(message)
}



export async function executeSQL(query: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `message=${encodeURIComponent('```sql\n' + query + '\n```')}`,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}
