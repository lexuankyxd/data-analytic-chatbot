// File: src/App.js
import { useState, useEffect, KeyboardEvent, MouseEvent, ChangeEvent } from 'react';
import { BASE_URL } from './config/config';
import InfoCard from './components/InfoCard';
import StatusIndicator from './components/StatusIndicator';
import DataTable from './components/DataTable';
import UserProfile from './components/UserProfile';
import ChatMessage from './components/ChatMessage';
import { CMessage, DashItem } from './types';
import ToolCall from './components/ToolCall'
import { BASE_WEBSOCKET_URL } from './config/config';

var ws: WebSocket | null = null;
function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Message state for chat
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<CMessage[]>([]);
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // File
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [filePreview, setFilePreview] = useState<string | ArrayBuffer | null>();
  const [tools, setTools] = useState<DashItem[]>([]);

  var intervalId: number;
  const analyticsData = [
    { label: 'Messages', value: chatMessages.length },
    { label: 'Response Time', value: '0.8s' },
    { label: 'Satisfaction', value: '97%' }
  ];

  useEffect(() => {
    try {
      const validateToken = async () => {
        const r = await fetch(BASE_URL + "/account/validate",
          {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: localStorage.getItem("authToken") })
          })
        const data = await r.json();
        if ("message" in data && data.message == "Token valid") {
          setIsAuthenticated(true)
        } else {
          handleLogout();
        }
      }
      validateToken()
    } catch (err) {
      console.error(err)
    }
  }, []);

  // Login handler
  const handleLogin = async (e: MouseEvent<HTMLButtonElement>) => {
    e && e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password');
    } else if (password.length < 8) {
      setLoginError("Password length is not valid")
    } else {
      const response = await fetch(BASE_URL + "/account/login", {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if ("access_token" in data) {
        localStorage.setItem('authToken', data["access_token"]);
        localStorage.setItem('email', email)
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError(data["message"])
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rInterval');
    localStorage.removeItem('ws');
    if (intervalId)
      clearInterval(intervalId);
    setIsAuthenticated(false);
    const res = await fetch(BASE_URL + "/account/logout", { credentials: "include" });
    console.log(res)
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create a preview if it's an image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Add a message about the uploaded image
      setChatMessages([
        ...chatMessages,
        {
          text: `Uploaded an image: ${file.name}`,
          sender: 'user',
          hasAttachment: true,
          fileType: 'image',
          preview: URL.createObjectURL(file)
        }
      ]);
    } else {
      // Add a message about the uploaded file
      setChatMessages([
        ...chatMessages,
        {
          text: `Uploaded a file: ${file.name}`,
          sender: 'user',
          hasAttachment: true,
          fileType: 'document',
          preview: undefined
        }
      ]);
    }

    // Clear the file input
    e.target.value = '';

    // Simulate bot response acknowledging the file
    setTimeout(() => {
      setChatMessages(prevMessages => [
        ...prevMessages,
        { text: `I've received your file: ${file.name}. How would you like me to help with this?`, sender: 'bot', hasAttachment: false, fileType: undefined, preview: undefined }
      ]);
    }, 1000);
  };

  // Chat message handler
  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    // Add user message to chat
    setChatMessages([...chatMessages, { text: message, sender: 'user', hasAttachment: false, fileType: undefined, preview: undefined }]);

    ws?.send(message)

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
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Render login page
  const renderLoginPage = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {loginError}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render chat page
  const renderChatPage = () => {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
        <div className="w-full h-full rounded-lg shadow-2xl flex flex-col overflow-hidden bg-gray-50">
          <div className="flex flex-1 overflow-hidden">
            {/* Chat area with gradient background */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-800">Inda Assistant</h1>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-6 pb-6 message-container">
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <ChatMessage
                      key={index}
                      text={msg.text}
                      sender={msg.sender}
                      hasAttachment={msg.hasAttachment}
                      fileType={msg.fileType}
                      preview={msg.preview}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dashboard section with reusable components */}
            <div className="bg-gray-800 text-white w-1/3 p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-6 text-center">Dashboard</h2>
              <div className="overflow-scroll rounded-lg">
                {tools.map((dashItem, index) => (
                  <InfoCard
                    key={index}
                    title={dashItem.title}
                    children={dashItem.children}
                  />
                ))}
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
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-grow px-4 py-3 rounded-full bg-white border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />

            {/* File upload button */}
            <label className="ml-3 px-3 py-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors cursor-pointer flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
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
    )
  };

  if (isAuthenticated && !localStorage.getItem("rInterval")) {
    intervalId = setInterval(async () => {
      const response = await fetch(BASE_URL + "/account/refresh", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if ("access_token" in data) {
        localStorage.setItem('authToken', data["access_token"]);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        handleLogout()
      }

    }, 1000 * 60 * 14);
    localStorage.setItem("rInterval", "t");
  }


  if (isAuthenticated && ws == null) {
    ws = new WebSocket(BASE_WEBSOCKET_URL + "/chat?token=" + localStorage.getItem("authToken"))
    console.log("WS OPEN")
    ws.onmessage = (message) => {
      if (message.type == "message") {
        if (message.data.substring(0, 3) == "ERR") {
          const ERR_CODE = message.data.substring(4);
          // if (ERR_CODE == "Invalid access token")
          //   handleLogout();
        } else if (message.data.substring(0, 3) == "MSG") {

          setChatMessages(prevMessages => [
            ...prevMessages,
            { text: message.data.substring(4), sender: 'bot', hasAttachment: false, fileType: undefined, preview: undefined }
          ]);
          // } else if (message.data.substring(0, 3) == "TL0") {
          //   const x = JSON.parse(message.data.substring(4))
          //   console.log(x)
          //   setTools(prevTools => [
          //     ...prevTools,
          //     { title: "Tool Call", children: ToolCall(x) }
          //   ]);
        } else {
          setChatMessages(prevMessages => [
            ...prevMessages,
            { text: message.data.substring(4), sender: 'bot', hasAttachment: false, fileType: undefined, preview: undefined }
          ]);

        }
        scrollToBottom()

      }
    }

    ws.onclose = (event) => {
      // handleLogout()
      ws = null
      console.log("WS CLOSED")
    }
  }

  // Conditional rendering based on authentication state
  return isAuthenticated ? renderChatPage() : renderLoginPage();
}
export default App;
