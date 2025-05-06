
const renderChatPage = () => (
  <div className="flex h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
    <div className="w-full h-full rounded-lg shadow-2xl flex flex-col overflow-hidden bg-gray-50">
      <div className="flex flex-1">
        {/* Chat area with gradient background */}
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 flex-grow flex flex-col overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-800">AI Assistant</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="flex-grow space-y-4">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-2xl py-3 px-4 max-w-sm shadow-md
                    ${msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data display with modern styling */}
        <div className="bg-gray-800 text-white w-1/3 p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-6 text-center">Dashboard</h2>

          <div className="bg-gray-700 rounded-lg p-4 mb-4 shadow-inner">
            <h3 className="text-gray-300 text-sm uppercase tracking-wider mb-2">Session Info</h3>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <p className="text-sm text-gray-200">Active Session</p>
            </div>
            <p className="text-sm text-gray-300">Started: 14:32</p>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-4 shadow-inner">
            <h3 className="text-gray-300 text-sm uppercase tracking-wider mb-2">Analytics</h3>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-300">Messages</p>
              <p className="text-gray-200 font-medium">{chatMessages.length}</p>
            </div>
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-gray-300">Response Time</p>
              <p className="text-gray-200 font-medium">0.8s</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">Satisfaction</p>
              <p className="text-gray-200 font-medium">97%</p>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 shadow-inner">
            <h3 className="text-gray-300 text-sm uppercase tracking-wider mb-2">User Profile</h3>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500 mr-3 flex items-center justify-center text-white font-medium">
                {email ? email.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-gray-200 font-medium">{email || 'User'}</p>
                <p className="text-xs text-gray-400">Premium Member</p>
              </div>
            </div>
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
