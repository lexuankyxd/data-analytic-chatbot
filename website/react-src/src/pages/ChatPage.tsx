import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatMessage from "../components/ChatMessage";
import DataTable from "../components/DataTable";
import { BASE_URL } from "../config/config";
import { MessageItem } from "../types";
import { connectToWebSocket, sendMessageToWebSocket, ws } from "../websocket";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const sampleCMessage = { text: "A", sender: "user" };

  if (!localStorage.getItem("authToken")) navigate("/login");

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("email");
    clearInterval(localStorage.getItem("rIntervalId")! as unknown as number);
    try {
      const res = await fetch(BASE_URL + "/account/logout", {
        headers: {
          "ngrok-skip-browser-warning": "true", // ngrok specific header to bypass warning page
        },
        credentials: "include",
      });
      console.log(res);
    } catch (e) {
      console.log(e);
    }
    navigate("/login");
  };

  if (ws == null || ws.readyState == ws.CLOSED) {
    connectToWebSocket();
    console.log("WS OPEN");

    ws!.onmessage = (message) => {
      //   try {
      //     const validateToken = async () => {
      //       const r = await fetch(BASE_URL + "/account/validate",
      //         {
      //           method: "POST",
      //           headers: {
      //             'Content-Type': 'application/json',
      //             'ngrok-skip-browser-warning': 'true'  // ngrok specific header to bypass warning page
      //           },
      //           body: JSON.stringify({ access_token: localStorage.getItem("authToken") })
      //         })
      //       const data = await r.json();
      //       if ("message" in data && data.message == "Token valid") {
      //       } else {
      //         handleLogout();
      //       }
      //     }
      {
        if (message.type == "message") {
          if (message.data.substring(0, 3) == "ERR") {
            const ERR_CODE = message.data.substring(4);
            if (ERR_CODE == "Invalid access token") handleLogout();
          } else if (message.data.substring(0, 3) == "MSG") {
            setChatMessages((prevMessages) => [
              ...prevMessages,
              { data: { text: message.data.substring(4), sender: "bot" } },
            ]);
          } else {
            setChatMessages((prevMessages) => [
              ...prevMessages,
              { data: { text: message.data.substring(4), sender: "bot" } },
            ]);
          }
        }
      }

      ws!.onclose = (event) => {
        // handleLogout()
        console.log(event);
        console.log("WS CLOSED");
      };
    };
  }

  // Logout handler

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? [...e.target.files] : [];
    if (!file || file.length == 0) return;

    setSelectedFiles([...selectedFiles, ...file]);

    // Create a preview if it's an image
    file.forEach((f) => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { data: { name: f.name, size: "" + f.size } },
      ]);
    });
    // Clear the file input
    e.target.value = "";

    // Simulate bot response acknowledging the file
    setTimeout(() => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          data: {
            text: `I've received your file: ${"AA"}. How would you like me to help with this?`,
            sender: "bot",
          },
        },
      ]);
    }, 1000);
  };

  // Chat message handler
  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Add user message to chat
    setChatMessages([
      ...chatMessages,
      { data: { text: message, sender: "user" } },
    ]);

    sendMessageToWebSocket(message);

    // Clear input
    setMessage("");
  };

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".message-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  // Handle Enter key in chat input
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const EnumTools = {
    current_dept_emp: {
      component: <DataTable data={[]} />,
    },
    department: {},
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <div className="w-full h-full rounded-lg shadow-2xl flex flex-col overflow-hidden bg-gray-50">
        <div className="flex flex-1 overflow-hidden">
          {/* Chat area with gradient background */}
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-indigo-800">
                Inda Assistant
              </h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="flex-grow overflow-y-auto px-6 pb-6 message-container">
              <div className="space-y-4">
                {chatMessages.map(
                  (msg, index) =>
                    msg.data.text && (
                      <ChatMessage
                        key={index}
                        text={msg.data.text}
                        sender={msg.data.sender}
                      />
                    )
                )}
              </div>
            </div>
          </div>

          {/* Dashboard section with reusable components */}
          <div className="bg-gray-800 text-white w-1/3 p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-center">Dashboard</h2>
            <div className="overflow-scroll rounded-lg">
              {/* {tools.map((dashItem, index) => (
              <InfoCard
                key={index}
                title={dashItem.title}
                children={dashItem.children}
              />
            ))} */}
            </div>

            <div className="mt-auto text-center text-xs text-gray-400">
              AI Powered Assistant
            </div>
          </div>
        </div>

        {/* Chat input bar with modern styling */}
        <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-grow px-4 py-3 rounded-full bg-white border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          {/* File upload button */}
          <label className="ml-3 px-3 py-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors cursor-pointer flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e)}
            />
          </label>

          <button
            onClick={handleSendMessage}
            className="ml-3 px-6 py-3 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
