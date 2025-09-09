import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from './ChatWindow';

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isGenerating,
  messagesEndRef,
}) => {
  return (
    <div className={`flex-1 p-4 space-y-4 min-h-0 ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto scrollbar-hide'} max-h-full`}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full overflow-hidden">
          <div className="text-center text-gray-400 max-w-md">
            <p className="text-lg font-medium mb-4">Welcome to the chat!</p>
            <p className="text-sm mb-6">Start typing to begin a conversation.</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] rounded-lg px-4 py-2 ${
                message.isUser
                  ? 'bg-gray-200 text-black'
                  : message.text.startsWith('Error:')
                  ? 'text-red-500'
                  : 'text-black'
              }`}
            >
              <div className="text-sm markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
      {isGenerating && !messages.some(msg => msg.isStreaming) && (
        <div className="flex justify-start">
          <div className="text-black rounded-lg px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
