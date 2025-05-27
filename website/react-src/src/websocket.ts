import { BASE_WEBSOCKET_URL } from "./config/config";

// Global WebSocket instance
let ws = null;

// Function to create and connect WebSocket
const connectToWebSocket = () => {
  // Close existing connection if any
  if (ws) {
    ws.close();
  }

  // Create new WebSocket connection
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found");
    return null;
  }

  try {
    ws = new WebSocket(`${BASE_WEBSOCKET_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return ws;
  } catch (error) {
    console.error("Failed to create WebSocket:", error);
    return null;
  }
};

// Function to send message via WebSocket
const sendMessageToWebSocket = (message) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log("WebSocket not connected, attempting to reconnect...");
    ws = connectToWebSocket();

    // If we still can't connect, return an error
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Failed to establish WebSocket connection");
      return false;
    }

    // If the socket is connecting, wait for it to open
    if (ws.readyState === WebSocket.CONNECTING) {
      ws.addEventListener('open', () => {
        sendMessage();
      });
      return true;
    }
  }

  function sendMessage() {
    try {
      ws.send(JSON.stringify({
        type: "MSG",
        message: message
      }));
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  return sendMessage();
};

export { ws, connectToWebSocket, sendMessageToWebSocket };
