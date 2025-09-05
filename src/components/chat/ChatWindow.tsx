import React, { useState, useRef, useEffect } from 'react';
import { useEchoModelProviders } from '@/hooks/useEchoModelProviders';
import { generateText } from 'ai';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { openai } = useEchoModelProviders();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!openai || !text.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Update messages with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      // Convert conversation history to AI SDK format
      const conversationHistory = updatedMessages.map(msg => ({
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text,
      }));

      const response = await generateText({
        model: await openai('gpt-4'),
        messages: conversationHistory,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error: Failed to generate response. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex min-h-0 w-full flex-col h-full">
      <MessageList 
        messages={messages}
        isGenerating={isGenerating}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput 
        onSend={handleSendMessage}
        disabled={!openai}
        isGenerating={isGenerating}
      />
    </div>
  );
};
