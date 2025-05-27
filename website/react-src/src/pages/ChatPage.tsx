import { BASE_URL } from "../config/config";
import { ChangeEvent, KeyboardEvent } from "react";
import { useState, useEffect } from "react";
import { MessageItem, CMessage, FileMessage, FileWithProgress, ToolMessage } from "../types";
import { useNavigate } from 'react-router-dom'
import ChatMessage from "../components/ChatMessage";
import { Wrench, Settings, BarChart2, User, FileText } from 'lucide-react';
import TabContent from "../components/TabContent";
import Toast from "../components/Toast";
import { ws, connectToWebSocket, sendMessageToWebSocket } from "../websocket";
import FileItem from "../components/FileItem";
import ToolResult from "../components/ToolsContainer"
import { getCurrentTimestamp, processToolMessages } from "../utils/helpers";

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('documents');
  const navigate = useNavigate();
  const [error, setError] = useState<{ message: string, type: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<CMessage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithProgress[]>([]);
  const [toolResults, setToolResults] = useState<ToolMessage[]>([]);

  // Use effect to initialize WebSocket connection on component mount
  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem("authToken")) {
      navigate("/login");
      return;
    }

    // Initialize WebSocket connection
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      connectToWebSocket();
      console.log("WS OPEN");
    }

    // WebSocket event handlers
    const handleWebSocketMessage = (message) => {
      if (message.type === "message") {
        const data = JSON.parse(message.data);
        console.log("WebSocket message received:", data);

        if (data.type === "EER") {
          const ERR_CODE = data.message;
          if (ERR_CODE === "Invalid access token") {
            handleLogout("ws err code");
          }
        } else if (data.type === "MSG") {
          console.log("Bot message received:", data.message);
          setChatMessages(prevMessages => [
            ...prevMessages,
            { text: data.message, sender: 'bot' }
          ]);
        } else {
          setToolResults((prevTool) => [
            ...prevTool, processToolMessages("" + prevTool.length, data.type, data.message)
          ]);
        }
      }
    };

    const handleWebSocketClose = (event) => {
      console.log("WS CLOSED", event);
    };

    // Add event listeners
    if (ws) {
      ws.addEventListener('message', handleWebSocketMessage);
      ws.addEventListener('close', handleWebSocketClose);

      // Clean up event listeners on component unmount
      return () => {
        ws.removeEventListener('message', handleWebSocketMessage);
        ws.removeEventListener('close', handleWebSocketClose);
      };
    }
  }, [navigate]); // Only re-run if navigate changes

  const getFileProgress = async (name: string) => {
    const r = await fetch(BASE_URL + "/chat/progress", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({
        file: name
      })
    });
    const data = await r.json();
    console.log(data)
    if (data.message)
      setUploadedFiles(prevFiles =>
        prevFiles.map(f => {
          console.log(f.file.name.split("-").join(""), name.split("-")[1])
          // Match file by name after splitting/joining as needed
          if (f.file.name.split("-").join("") === name.split("-")[1]) {
            // Return a new object with updated progress
            return { ...f, progress: Math.round(data.message * 10) / 10 };
          }
          return f;
        })
      );
    return data.message;
  }

  const handleLogout = async (msg: string) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    clearInterval(localStorage.getItem("rIntervalId")! as unknown as number)
    try {
      const res = await fetch(BASE_URL + "/account/logout", {
        headers: {
          'ngrok-skip-browser-warning': 'true'  // ngrok specific header to bypass warning page
        }, credentials: "include"
      });
      console.log(msg, res)
    } catch (e) { console.log(e) };
    navigate("/login")
  };

  const showError = (message) => {
    setError({ message, type: 'error' });
  };

  const showSuccess = (message) => {
    setError({ message, type: 'success' });
  };

  const clearError = () => {
    setError(null);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const tmp = e.target.files ? [...e.target.files] : [];
    const fileArr: FileWithProgress[] = [];
    if (!tmp || tmp.length == 0) return;
    const formData = new FormData();

    tmp.forEach((f) => {
      formData.append("files", f)
    })

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL + '/chat/upload', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("authToken"));
    xhr.onload = async function () {
      if (xhr.status === 200) {
        const arr = new Map<string, { id: string, progress: number }>();
        JSON.parse(xhr.responseText).file_id.map((f: string) => {
          arr.set(f.split("-")[1], { id: f, progress: 0 });
        });
        for (let i = 0; i < tmp.length; i++) {
          if (arr.has(tmp[i].name.split("-").join(""))) {
            setUploadedFiles(prevState => {
              return [...prevState, { file: tmp[i], progress: 0 }];
            });
            fileArr.push({ file: tmp[i], progress: 0 });
          }
        }

        const i_id = setInterval(async () => {
          for (const [key, value] of arr) {
            const x = await getFileProgress(value.id)
            if (x == 100) {
              arr.delete(key);
            }
          }
          if (arr.size == 0)
            clearInterval(i_id);
        }, 2500);
      } else {
        showError(JSON.parse(xhr.responseText).error);
      }
    };

    xhr.send(formData);
    e.target.value = '';
  };

  // Chat message handler
  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    // Add user message to chat
    setChatMessages(prevMessages => [...prevMessages, { text: message, sender: 'user' }]);

    // Send to WebSocket
    sendMessageToWebSocket(message);

    // Clear input
    setMessage('');
  };

  const scrollToBottom = () => {
    const chatContainer = document.querySelector('.message-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Handle Enter key in chat input
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault();
        setMessage(message + '\n');
      } else
        handleSendMessage();
    }
  };

  const tabs = [
    {
      id: 'documents',
      title: 'Documents',
      icon: <FileText size={18} />,
      content: (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <FileItem key={index} name={file.file.name} size={file.file.size} progress={file.progress} />
          ))}
        </div>
      )
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: <Wrench size={18} />,
      content: (
        <div className="p-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tool Calls</h3>
            <div className="text-xs text-gray-600">
              {toolResults.length} results
            </div>
          </div>

          {toolResults.length > 0 ? (
            <div className="space-y-1">
              {toolResults.map(tool => (
                <ToolResult
                  key={tool.id}
                  type={tool.type}
                  data={tool.data}
                  timestamp={tool.timestamp}
                  expanded={tool.expanded}
                  onToggle={() => {
                    setToolResults(toolResults.map((t) => {
                      if (tool.id == t.id) {
                        t.expanded = !t.expanded;
                        return t;
                      }
                      return t;
                    }));
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tool calls have been made yet
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {error && (
        <Toast
          message={error.message}
          type={error.type}
          onClose={clearError}
        />
      )}

      <div className="w-full h-full shadow-md flex flex-col overflow-hidden bg-transparent">
        <div className="flex flex-1 overflow-hidden">
          {/* Chat area with light background */}
          <div className="bg-white rounded-lg mr-2 w-9/12 flex-grow flex flex-col overflow-y-auto p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-indigo-700">Inda Assistant</h1>
              <button
                onClick={() => handleLogout("logout button")}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pb-6 message-container">
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <ChatMessage
                    key={index}
                    text={msg.text}
                    sender={msg.sender}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard section with light mode */}
          <div className="bg-white rounded-lg text-gray-900 w-1/3 p-4 flex flex-col shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-indigo-700">Dashboard</h2>

            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 mr-2 rounded-t-lg transition-colors ${activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-indigo-600'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  <span className="text-sm">{tab.title}</span>
                </button>
              ))}
            </div>

            {/* Tab content container */}
            <div className="flex-grow overflow-hidden">
              {tabs.map(tab => (
                <TabContent
                  key={tab.id}
                  title={tab.title}
                  active={activeTab === tab.id}
                >
                  {tab.content}
                </TabContent>
              ))}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              AI Powered Assistant
            </div>
          </div>
        </div>

        {/* Chat input bar with light styling */}
        <div className="bg-white mt-2 rounded-lg p-4 border-t border-gray-200 flex items-center shadow-sm">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            style={{ resize: "none" }}
            className="flex-grow px-4 py-3 overflow-y-auto rounded-xl bg-gray-50 border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          {/* File upload button */}
          <label className="ml-3 px-3 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <input
              multiple
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e)}
            />
          </label>

          <button
            onClick={handleSendMessage}
            className="ml-3 px-6 py-3 bg-indigo-500 text-white font-medium rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
