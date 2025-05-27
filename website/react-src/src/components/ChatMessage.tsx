import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import Markdown from "react-markdown";

/**
 * Component for rendering individual chat messages
 * @param {Object} props
 * @param {string} props.text - The message text
 * @param {string} props.sender - The sender type ('user' or 'bot')
 */
const ChatMessage = ({ text, sender }: { text: string, sender: string }) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl py-3 px-4 max-w-4xl shadow-md
          ${isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
          }`}
      >
        <div className="prose prose-sm max-w-none break-words">
          <Markdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              // Custom styling for different elements
              h1: ({ children }) => (
                <h1 className={`text-xl font-bold mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className={`text-lg font-semibold mb-2 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`text-base font-medium mb-1 ${isUser ? 'text-white' : 'text-gray-700'}`}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className={`mb-2 last:mb-0 leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className={`list-disc pl-4 mb-2 space-y-1 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className={`list-decimal pl-4 mb-2 space-y-1 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 pl-4 py-2 my-2 italic
                  ${isUser
                    ? 'border-indigo-300 text-indigo-100'
                    : 'border-gray-300 text-gray-600 bg-gray-50'
                  }`}>
                  {children}
                </blockquote>
              ),
              code: ({ inline, children, className }) => {
                if (inline) {
                  return (
                    <code className={`px-1 py-0.5 rounded text-sm font-mono
                      ${isUser
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className={`bg-sky-200 p-3 rounded-lg overflow-x-auto text-sm my-2
                  ${isUser
                    ? 'bg-indigo-800 text-gray-800'
                    : 'bg-gray-900 text-gray-800'
                  }`}>
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-2">
                  <table className={`min-w-full border-collapse
                    ${isUser ? 'text-white' : 'text-gray-800'}`}>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className={`border px-3 py-2 text-left font-semibold
                  ${isUser
                    ? 'border-indigo-400 bg-indigo-700'
                    : 'border-gray-300 bg-gray-50'
                  }`}>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className={`border px-3 py-2
                  ${isUser ? 'border-indigo-400' : 'border-gray-300'}`}>
                  {children}
                </td>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline hover:no-underline
                    ${isUser
                      ? 'text-indigo-200 hover:text-white'
                      : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className={`font-semibold ${isUser ? 'text-white' : 'text-gray-900'}`}>
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className={`italic ${isUser ? 'text-white' : 'text-gray-800'}`}>
                  {children}
                </em>
              ),
              hr: () => (
                <hr className={`my-4 border-t
                  ${isUser ? 'border-indigo-400' : 'border-gray-300'}`} />
              ),
            }}
          >
            {text}
          </Markdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
