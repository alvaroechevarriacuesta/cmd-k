import React, { useState, useRef, useEffect } from 'react';
import { useEchoModelProviders } from '@/hooks/useEchoModelProviders';
import {generateText } from 'ai';
import { useEcho } from '@/hooks/useEcho';
import { WelcomePage } from './welcome';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const Chat: React.FC = () => {
  const { echoClient } = useEcho();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelsByProvider, setModelsByProvider] = useState<Record<string, string[]>>({});
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { openai } = useEchoModelProviders();

  // Fetch supported models when echoClient is available
  useEffect(() => {
    const fetchModels = async () => {
      if (!echoClient) return;
      
      setIsLoadingModels(true);
      try {
        const supportedModels = await echoClient.models.listSupportedChatModels();
        
        // Group models by provider
        const grouped = supportedModels.reduce((acc, model) => {
          const provider = model.provider || 'Unknown';
          if (!acc[provider]) {
            acc[provider] = [];
          }
          acc[provider].push(model.model_id);
          return acc;
        }, {} as Record<string, string[]>);
        
        setModelsByProvider(grouped);
      } catch (error) {
        console.error('Error fetching models:', error);
        setModelsByProvider({});
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [echoClient]);

  const handleSendMessage = async () => {
    if (!openai || !input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
      const response = await generateText({
        model: await openai('gpt-4'),
        messages: [{ role: 'user', content: userMessage.text }],
      })
      setMessages(prev => [...prev, { id: Date.now().toString(), text: response.text, isUser: false, timestamp: new Date() }]);
      setIsGenerating(false);
      return response;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative flex min-h-0 w-full flex-col h-full">
      {/* Messages Area - Fixed at top, scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400 max-w-md">
              <p className="text-lg font-medium mb-4">Welcome to the chat!</p>
              <p className="text-sm mb-6">Start typing to begin a conversation.</p>
              
              {isLoadingModels ? (
                <div className="mb-4">
                  <p className="text-sm mb-2">Loading available models...</p>
                  <div className="flex justify-center">
                    <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              ) : Object.keys(modelsByProvider).length > 0 ? (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-3">Available Models:</p>
                  <div className="space-y-4 text-xs">
                    {Object.entries(modelsByProvider).map(([provider, models]) => (
                      <div key={provider} className="space-y-2">
                        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                          {provider}
                        </p>
                        <div className="grid grid-cols-1 gap-1 ml-2">
                          {models.map((model, index) => (
                            <div 
                              key={index}
                              className="bg-gray-700 rounded-md px-3 py-1.5 text-gray-300 flex justify-between items-center"
                            >
                              <span>{model}</span>
                              <span className="text-xs text-gray-400 bg-gray-600 px-2 py-0.5 rounded">
                                {provider}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : message.text.startsWith('Error:')
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom, can grow */}
      <div className="border-t border-gray-700 p-4 flex-shrink-0">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
            rows={1}
            style={{
              minHeight: '40px',
              maxHeight: '120px',
              height: 'auto',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isGenerating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 self-end"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};