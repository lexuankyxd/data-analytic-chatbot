import React from 'react';

/**
 * Component for rendering individual chat messages
 * @param {Object} props
 * @param {string} props.text - The message text
 * @param {string} props.sender - The sender type ('user' or 'bot')
 * @param {boolean} [props.hasAttachment] - Whether the message has a file attachment
 * @param {string} [props.fileType] - Type of attached file ('image' or 'document')
 * @param {string} [props.preview] - URL for image preview
 */
const ChatMessage = ({ text, sender, hasAttachment, fileType, preview }) => {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-2xl py-3 px-4 max-w-sm shadow-md
          ${sender === 'user'
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
          }`}
      >
        <div className="flex flex-col">
          {text}

          {/* File attachment preview */}
          {hasAttachment && fileType === 'image' && preview && (
            <div className="mt-2 rounded overflow-hidden">
              <img
                src={preview}
                alt="Uploaded image"
                className="max-h-40 w-auto"
              />
            </div>
          )}

          {/* File attachment icon for non-images */}
          {hasAttachment && fileType === 'document' && (
            <div className="mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">File attached</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
