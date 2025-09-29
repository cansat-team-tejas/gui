import { useState, useCallback } from "react";
import { ChatMessage } from "../components/chat-message";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ai",
  content:
    "Hello! I'm your CanSat Mission AI Assistant. I have access to all your telemetry data, logs, and can execute commands. Ask me anything about the mission or tell me what you'd like to do!",
  timestamp: new Date(),
};

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback((message: Omit<ChatMessage, "id">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addUserMessage = useCallback(
    (content: string) => {
      addMessage({
        role: "user",
        content,
        timestamp: new Date(),
      });
    },
    [addMessage]
  );

  const addAIMessage = useCallback(
    (content: string, commandExecuted?: string) => {
      addMessage({
        role: "ai",
        content,
        timestamp: new Date(),
        commandExecuted,
      });
    },
    [addMessage]
  );

  const addErrorMessage = useCallback(
    (
      error: string = "I encountered an error processing your request. Please try again."
    ) => {
      addMessage({
        role: "ai",
        content: error,
        timestamp: new Date(),
      });
    },
    [addMessage]
  );

  return {
    messages,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
  };
};
