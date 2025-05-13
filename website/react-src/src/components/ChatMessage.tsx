/**
 * Component for rendering individual chat messages
 * @param {Object} props
 * @param {string} props.text - The message text
 * @param {string} props.sender - The sender type ('user' or 'bot')
 */
const ChatMessage = ({ text, sender }: { text: string; sender?: string }) => {
  return (
    <div
      className={`flex ${sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-2xl py-3 px-4 max-w-sm shadow-md
          ${
            sender === "user"
              ? "bg-indigo-600 text-white rounded-tr-none"
              : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
          }`}
      >
        <div className="flex flex-col">{text}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
