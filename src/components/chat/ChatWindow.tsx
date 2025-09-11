import React, { useState, useRef, useEffect } from "react";
import { useEchoModelProviders } from "@/hooks/useEchoModelProviders";
import { streamText } from "ai";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import {
  getContextFromTabs,
  formatMultipleTabContentsForSystemPrompt,
} from "@/lib/tabContent";
import { type SupportedModel } from "@merit-systems/echo-typescript-sdk";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Context {
  tabId: number;
  url: string;
  title: string;
}

const DEFAULT_PROVIDER_MODEL: SupportedModel = {
  provider: "openai",
  model_id: "gpt-4o-mini",
  input_cost_per_token: 0.00015,
  output_cost_per_token: 0.0006,
};

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const [contexts, setContexts] = useState<Context[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [providerModel, setProviderModel] = useState<SupportedModel>(
    DEFAULT_PROVIDER_MODEL,
  );
  const { openai, anthropic, google } = useEchoModelProviders();

  // Connect to the side panel port and listen for context updates
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "sidePanelPort" });

    port.onMessage.addListener((message) => {
      if (message.action === "ADD_CONTEXT") {
        const incomingContext = message.context;

        setContexts((prev) => {
          // Check if a context with the same tabId already exists
          const existingTabIndex = prev.findIndex(
            (context) => context.tabId === incomingContext.tabId,
          );

          if (existingTabIndex !== -1) {
            // Tab ID already exists - only update if URL is different
            const existingContext = prev[existingTabIndex];
            if (existingContext.url !== incomingContext.url) {
              // URL is different, update the context with new title and URL
              const newContexts = [...prev];
              newContexts[existingTabIndex] = incomingContext;
              return newContexts;
            }
            // Same tab ID and same URL, no update needed
            return prev;
          }

          // New tab ID, add it to the list
          return [...prev, incomingContext];
        });
      }
    });

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected from ChatWindow");
    });

    return () => {
      port.disconnect();
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      // Fetch current tab content from all contexts
      const tabContents = await getContextFromTabs(contexts);
      setIsFetchingContext(false);
      setIsGenerating(true);

      // Convert conversation history to AI SDK format without adding tab content to messages
      const conversationHistory = updatedMessages.map((msg) => ({
        role: (msg.isUser ? "user" : "assistant") as "user" | "assistant",
        content: msg.text,
      }));

      // Get the appropriate provider client based on the selected provider
      const getProviderClient = () => {
        switch (providerModel.provider.toLowerCase()) {
          case "openai":
            return openai;
          case "anthropic":
            return anthropic;
          case "gemini":
            return google;
          default:
            return openai;
        }
      };

      const providerClient = getProviderClient();
      console.log("providerClient", providerClient);
      if (!providerClient) {
        throw new Error(`Provider ${providerModel.provider} not available`);
      }

      // Create system prompt with optional tab content context
      const baseSystemPrompt = `You are a helpful assistant. The current date and time is ${new Date().toLocaleString()}. Whenever you are asked to write code, you must include a language with \`\`\``;
      const tabContextPrompt =
        formatMultipleTabContentsForSystemPrompt(tabContents);
      const systemPrompt = baseSystemPrompt + tabContextPrompt;

      console.log("=== SYSTEM PROMPT DEBUG ===");
      console.log("Base system prompt:", baseSystemPrompt);
      console.log("Tab contexts count:", tabContents.length);
      console.log("Tab context prompt:", tabContextPrompt);
      console.log("Full system prompt:", systemPrompt);
      console.log("=== END SYSTEM PROMPT DEBUG ===");

      const response = await streamText({
        model: await providerClient(providerModel.model_id),
        system: systemPrompt,
        messages: conversationHistory,
      });

      // Create initial assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        text: "",
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      };

      // Add the initial empty assistant message
      setMessages((prev) => [...prev, assistantMessage]);

      // Stream the response
      for await (const delta of response.textStream) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: msg.text + delta }
              : msg,
          ),
        );
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg,
        ),
      );
    } catch (error) {
      console.error("Error generating response:", error);

      // If there's a streaming message that was interrupted, mark it as completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false } : msg,
        ),
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Error: Failed to generate response. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        contexts={contexts}
        setContexts={setContexts}
        setProviderModel={setProviderModel}
        isGenerating={isGenerating}
        isFetchingContext={isFetchingContext}
      />
    </div>
  );
};
