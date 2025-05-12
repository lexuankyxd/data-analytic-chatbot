import { useState } from 'react';

export default function ToolCall(id, fn, args,) {
  const [collapsed, setCollapsed] = useState(true);
  console.log(message)
  // Handle different message formats
  const renderMessageContent = () => {
    if (!message) return null;

    return (
      <div className="space-y-1">
        <div className="bg-blue-600 text-white p-1 rounded">
          {`{"id": "${message.id}",`}
        </div>
        <div className="bg-blue-600 text-white p-1 rounded">
          {`"${Object.keys(message)[1]}": "${message[Object.keys(message)[1]]}"${collapsed ? '...' : ','}`}
        </div>

        {!collapsed && (
          <>
            <div className="bg-blue-600 text-white p-1 rounded">
              {`"function": {"arguments": {`}
            </div>

            {/* Render variable number of arguments */}
            {Object.entries(message.function.arguments).map(([key, value], index, array) => (
              <div key={key} className="bg-blue-600 text-white p-1 rounded ml-4">
                {`"${key}": "${value}"${index < array.length - 1 ? ',' : ''}`}
              </div>
            ))}

            <div className="bg-blue-600 text-white p-1 rounded">
              {`},`}
            </div>

            {/* Additional fields */}
            {Object.entries(message)
              .filter(([key]) => key !== 'id' && key !== 'function' && key !== Object.keys(message)[1])
              .map(([key, value], index, array) => (
                <div key={key} className="bg-blue-600 text-white p-1 rounded">
                  {`"${key}": ${typeof value === 'object' ?
                    JSON.stringify(value) :
                    `"${value}"`}${index < array.length - 1 ? ',' : ''}`}
                </div>
              ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 max-w-xl">
      <div className="flex justify-between items-start">
        <div className="flex-1 overflow-x-auto font-mono text-sm">
          {renderMessageContent()}
        </div>
        <button
          onClick={() => collapsed = !collapsed}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          {collapsed ?
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Expand</span> :
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">Collapse</span>
          }
        </button>
      </div>
    </div>
  );
}
