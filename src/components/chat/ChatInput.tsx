import React, { useState, useRef } from 'react';
// import { useEchoModels } from '@/hooks/useEchoModels';
import { type SupportedModel } from '@merit-systems/echo-typescript-sdk';
import { ContextInfo } from './ContextInfo';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isGenerating?: boolean;
  isFetchingContext?: boolean;
  providerModel: SupportedModel;
  setProviderModel: (providerModel: SupportedModel) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, isGenerating = false, isFetchingContext = false, providerModel, setProviderModel }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // const {models, loading: modelsLoading} = useEchoModels();

  const handleSendMessage = () => {
    if (!input.trim() || disabled || isGenerating || isFetchingContext) return;
    onSend(input.trim());
    setInput('');
    
    // Reset textarea height after clearing input
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    
    // If textarea is empty, reset to minimum height
    if (target.value.trim() === '') {
      target.style.height = '40px';
    } else {
      target.style.height = Math.min(target.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="flex-shrink-0 p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex space-x-2">
          {/* Replace this div with full textarea functionality */}
          <div className="flex-1 border border-gray-300 rounded-lg px-4 py-2 min-h-[40px] overflow-y-auto flex flex-col justify-between">
            {/* Top (textarea) */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onInput={handleTextareaInput}
              placeholder={
                isFetchingContext
                  ? "Reading page content..."
                  : isGenerating
                  ? "AI is responding..."
                  : "Send a message..."
              }
              disabled={disabled}
              className="w-full text-black focus:outline-none resize-none bg-transparent"
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '200px',
                height: 'auto',
              }}
            />
            <ContextInfo model={providerModel} setProviderModel={setProviderModel}/>
          </div>
        </div>
      </div>
    </div>
  );
};
