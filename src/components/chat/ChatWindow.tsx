import React, { useState, useRef, useEffect } from 'react';
import { useEchoModelProviders } from '@/hooks/useEchoModelProviders';
import { useEchoModels } from '@/hooks/useEchoModels';
import { streamText } from 'ai';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';
import { getCurrentTabContent, formatTabContentForPrompt } from '@/lib/tabContent';
import { type SupportedModel } from '@merit-systems/echo-typescript-sdk';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

const DEFAULT_PROVIDER_MODEL: SupportedModel = {
  provider: 'openai', 
  model_id: 'gpt-4o-mini',
  input_cost_per_token: 0.00015,
  output_cost_per_token: 0.0006
};

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [providerModel, setProviderModel] = useState<SupportedModel>(DEFAULT_PROVIDER_MODEL);
  const { openai, anthropic, google } = useEchoModelProviders();
  const { models } = useEchoModels();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize providerModel with the first available model
  useEffect(() => {
    if (models && models.length > 0 && !providerModel) {
      setProviderModel(models[0]);
    }
  }, [models, providerModel]);

  const handleSendMessage = async (text: string) => {
    if (!providerModel || !text.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Update messages with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsFetchingContext(true);

    try {
      // Fetch current tab content
      const tabContent = await getCurrentTabContent();
      setIsFetchingContext(false);
      setIsGenerating(true);
      
      // Convert conversation history to AI SDK format
      const conversationHistory = updatedMessages.map((msg, index) => {
        let content = msg.text;
        
        // Add tab content as context to the latest user message
        if (msg.isUser && index === updatedMessages.length - 1 && tabContent.content) {
          content = `${msg.text}${formatTabContentForPrompt(tabContent)}`;
        }
        
        return {
          role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
          content,
        };
      });

      // Get the appropriate provider client based on the selected provider
      const getProviderClient = () => {
        switch (providerModel.provider) {
          case 'openai':
            return openai;
          case 'anthropic':
            return anthropic;
          case 'gemini':
            return google;
          default:
            return openai;
        }
      };

      const providerClient = getProviderClient();
      console.log('providerClient', providerClient);
      if (!providerClient) {
        throw new Error(`Provider ${providerModel.provider} not available`);
      }

      const response = await streamText({
        model: await providerClient(providerModel.model_id),
        system: 'You are a helpful assistant that can answer questions and help with tasks. Please keep the answers relatively concise, and respond in properly formatted markdown.You should try to use bullet points if necessary.',
        messages: conversationHistory,
      });

      // Create initial assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };

      // Add the initial empty assistant message
      setMessages(prev => [...prev, assistantMessage]);

      // Stream the response
      for await (const delta of response.textStream) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, text: msg.text + delta }
              : msg
          )
        );
      }

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (error) {
      console.error('Error generating response:', error);
      
      // If there's a streaming message that was interrupted, mark it as completed
      setMessages(prev => 
        prev.map(msg => 
          msg.isStreaming ? { ...msg, isStreaming: false } : msg
        )
      );
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error: Failed to generate response. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsFetchingContext(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <MessageList 
        messages={messages}
        isGenerating={isGenerating || isFetchingContext}
        messagesEndRef={messagesEndRef}
      />
      <ChatInput 
        onSend={handleSendMessage}
        disabled={!providerModel}
        providerModel={providerModel}
        setProviderModel={setProviderModel}
        isGenerating={isGenerating}
        isFetchingContext={isFetchingContext}
      />
    </div>
  );
};
