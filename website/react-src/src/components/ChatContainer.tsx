import React, { useState, useEffect, useRef, forwardRef, ForwardedRef } from 'react';
import { getAIResponse } from '../utils/api';
import { extractCodeBlocks } from '../utils/helpers';
import { Message, CodeBlock, ParsedCodePart } from '../types';

interface ChatContainerProps {
  tableContext: any[][];
  displayToast: (message: string, duration?: number) => void;
}

const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ tableContext, displayToast }, ref: ForwardedRef<HTMLDivElement>) => {
    const [messages, setMessages] = useState<Message[]>([
      { type: 'ai', content: "Hello! I'm your AI assistant. How can I help you today?" }
    ]);
    const [userInput, setUserInput] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);

    const chatLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chatLogRef.current) {
        chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
      }
    }, [messages, isTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      setUserInput(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    };

    const copyToClipboard = (text: string): void => {
      navigator.clipboard.writeText(text)
        .then(() => {
          displayToast('Code copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          displayToast('Failed to copy code');
        });
    };

    const executeSQL = async (query: string, codeBlockId: number): Promise<void> => {
      const updatedCodeBlocks = [...codeBlocks];
      if (updatedCodeBlocks[codeBlockId]?.executed) {
        displayToast('This query has already been executed');
        return;
      }

      // This should call the DbContainer's executeSQL function
      // For now we'll just mark it as executed
      updatedCodeBlocks[codeBlockId] = {
        ...updatedCodeBlocks[codeBlockId],
        executed: true
      };
      setCodeBlocks(updatedCodeBlocks);

      // TODO: Implement actual SQL execution logic
      displayToast('Query executed');
    };

    const sendMessage = async (): Promise<void> => {
      if (userInput.trim() === '') return;

      // Add user message to chat
      setMessages(prevMessages => [...prevMessages, { type: 'user', content: userInput }]);
      setIsTyping(true);

      // Clear input field
      setUserInput('');

      try {
        // Get AI response
        const response = await getAIResponse(userInput, tableContext);

        // Process response for code blocks
        const aiResponseContent = response.ai;
        const newCodeBlocks = [...codeBlocks];

        // Add AI message to chat
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'ai', content: aiResponseContent, codeBlocks: newCodeBlocks.length }
        ]);

        // Extract and store code blocks
        const extractedBlocks = extractCodeBlocks(aiResponseContent);
        const codeBlocksOnly = extractedBlocks
          .filter(part => part.type === 'code')
          .map(part => ({
            language: part.language || 'plaintext',
            content: part.content,
            executed: false
          }));

        setCodeBlocks(prevBlocks => [...prevBlocks, ...codeBlocksOnly]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'ai', content: "Sorry, I encountered an error processing your request." }
        ]);
      } finally {
        setIsTyping(false);
      }
    };

    const renderCodeBlock = (language: string, content: string, codeBlockId: number): JSX.Element => {
      return (
        <div className="code-block-container">
          <div className="code-block-header">
            <span>{language || 'plaintext'}</span>
            <div className="code-block-actions">
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(content)}
              >
                Copy
              </button>

              {language.toLowerCase() === 'sql' && (
                <button
                  className="execute-btn"
                  onClick={() => executeSQL(content, codeBlockId)}
                >
                  Execute
                </button>
              )}
            </div>
          </div>
          <div className="code-block-content">
            {content}
          </div>
        </div>
      );
    };

    const renderMessage = (message: Message, index: number): JSX.Element => {
      if (message.type === 'user') {
        return (
          <div key={index} className="message user-message">
            {message.content}
          </div>
        );
      } else {
        // Parse the AI message for code blocks
        const parts = extractCodeBlocks(message.content);

        return (
          <div key={index} className="message ai-message">
            {parts.map((part, partIndex) => {
              if (part.type === 'text') {
                return <span key={partIndex}>{part.content}</span>;
              } else if (part.type === 'code') {
                const codeBlockId = codeBlocks.findIndex(
                  block => block.language === part.language && block.content === part.content
                );

                return (
                  <React.Fragment key={partIndex}>
                    {renderCodeBlock(part.language || 'plaintext', part.content, codeBlockId)}
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
        );
      }
    };

    return (
      <div className="chat-container" ref={ref}>
        <div className="chat-box">
          <div className="chat-header">
            <div className="avatar">AI</div>
            <div className="info">
              <h2>AI Assistant</h2>
              <p>Online and ready to chat</p>
            </div>
          </div>

          <div className="chat-log" ref={chatLogRef}>
            {messages.map((message, index) => renderMessage(message, index))}

            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="user-input">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              autoComplete="off"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    );
  }
);

export default ChatContainer;
