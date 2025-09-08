import React, { useState } from 'react';
import { useEchoModels } from '@/hooks/useEchoModels';
import { type SupportedModel } from '@merit-systems/echo-typescript-sdk';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  isGenerating?: boolean;
  isFetchingContext?: boolean;
  providerModel?: SupportedModel;
  setProviderModel: (providerModel: SupportedModel) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, isGenerating = false, isFetchingContext = false, providerModel, setProviderModel }) => {
  const [input, setInput] = useState('');
  const {models, loading: modelsLoading} = useEchoModels();

  const handleSendMessage = () => {
    if (!input.trim() || disabled || isGenerating || isFetchingContext) return;
    onSend(input.trim());
    setInput('');
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
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-gray-700 p-4 flex-shrink-0">
      <div className="flex items-center mb-2 space-x-4">
        <select
          value={providerModel ? `${providerModel.provider}/${providerModel.model_id}` : ''}
            onChange={(e) => {
              if (e.target.value && models) {
                const selectedModel = models.find(m => `${m.provider}/${m.model_id}` === e.target.value);
                if (selectedModel) {
                  setProviderModel(selectedModel);
                }
              }
            }}
          className="bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isGenerating || isFetchingContext || modelsLoading}
        >
          {modelsLoading ? (
            <option value="">Loading models...</option>
          ) : models && models.length > 0 ? (
            models.map((modelItem) => (
              <option 
                key={`${modelItem.provider}/${modelItem.model_id}`} 
                value={`${modelItem.provider}/${modelItem.model_id}`}
              >
                {modelItem.provider.toUpperCase()} - {modelItem.model_id}
              </option>
            ))
          ) : (
            <option value="">No models available</option>
          )}
        </select>
        {(isGenerating || isFetchingContext) && (
          <span className="text-gray-400 text-sm">
            {isFetchingContext ? "Reading context..." : "Generating response..."}
          </span>
        )}
      </div>
      <div className="flex space-x-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onInput={handleTextareaInput}
          placeholder={isFetchingContext ? "Reading page content..." : isGenerating ? "AI is responding..." : "Type your message..."}
          disabled={disabled || isFetchingContext}
          className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            height: 'auto',
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || disabled || isGenerating || isFetchingContext}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 self-end transition-colors"
        >
          {isFetchingContext ? 'Reading...' : isGenerating ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
