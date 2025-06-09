import { useEffect, useState } from "react";
import { Thread } from "../types";
import { BASE_URL } from "../config/config";
const ThreadItem = ({ thread, isActive, onClick }: { thread: Thread, isActive: boolean, onClick: CallableFunction }) => (
  <div
    onClick={() => onClick(thread.id)}
    className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${isActive
      ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
      : 'bg-white border-transparent hover:bg-gray-50 text-gray-700'
      }`}
  >
    <div className="font-medium text-sm truncate">{thread.title}</div>
    {thread.timestamp ? <div className="text-xs text-gray-400 mt-1">{new Date(thread.timestamp).toLocaleDateString()}</div> : <></>}
  </div>
);

const ThreadPane = ({ switchThread }: { switchThread: (thread_id: string) => Promise<void> }) => {

  const [isThreadListCollapsed, setIsThreadListCollapsed] = useState(false);
  const [activeThread, setActiveThread] = useState("NULL");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [getThread, setGetThread] = useState(false);
  const getThreads = async () => {
    try {
      const res = await fetch(BASE_URL + "/chat/getThreads", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      const data = await res.json();
      setThreads(data)
      console.log(data);
    } catch (e) {
      console.log("Failed getting threads: " + e);
    }
  }
  if (!getThread) {
    getThreads();
    setGetThread(true);
  }
  const handleThreadSelect = (threadId: string) => {
    setActiveThread(threadId);
    switchThread(threadId)
  };
  useEffect(() => {
    localStorage.setItem("activeThreadId", activeThread);
  }, [activeThread]);
  const handleNewThread = async () => {
    try {
      await fetch(BASE_URL + "/chat/createThread", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      const temp_thread_id = crypto.randomUUID();
      setThreads((prevThreads) => [...prevThreads, { title: "NO NAME", id: temp_thread_id, timestamp: new Date().toLocaleString() }])
      handleThreadSelect(temp_thread_id);
    } catch (err) {
      console.log("New thread err " + err);
    }
  };

  return (
    <div className={`${isThreadListCollapsed ? 'w-12' : 'w-80'
      } transition-all duration-300 bg-white rounded-lg mr-2 flex flex-col shadow-sm`}>

      {/* Thread List Header */}
      <div className={isThreadListCollapsed ? "p-2 border-b border-gray-200 flex items-center justify-between" : "p-4 border-b border-gray-200 flex items-center justify-between"}>
        {!isThreadListCollapsed && (
          <>
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
            <button
              onClick={handleNewThread}
              className="text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="New Thread"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </>
        )}

        <button
          onClick={() => setIsThreadListCollapsed(!isThreadListCollapsed)}
          className="text-gray-600 hover:bg-gray-100 rounded-lg transition-colors p-0"
          title={isThreadListCollapsed ? "Expand Threads" : "Collapse Threads"}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isThreadListCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Thread List Content */}
      {!isThreadListCollapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {threads.map((thread) => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                isActive={activeThread === thread.id}
                onClick={handleThreadSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Collapsed state icons */}
      {isThreadListCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-4 space-y-3">
          {threads.slice(0, 5).map((thread) => (
            <button
              key={thread.id}
              onClick={() => handleThreadSelect(thread.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${activeThread === thread.id
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              title={thread.title}
            >
              {thread.title.charAt(0)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThreadPane;
