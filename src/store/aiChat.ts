import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { ChatMessage } from "../pages/ai-tab/types";
import { WELCOME_MESSAGE } from "../pages/ai-tab/types";

interface AIChatState {
  messages: ChatMessage[];
  isProcessing: boolean;
  addMessage: (message: Omit<ChatMessage, "id">) => void;
  addUserMessage: (content: string) => void;
  addAIMessage: (content: string, commandExecuted?: string) => void;
  addErrorMessage: (error?: string) => void;
  setIsProcessing: (value: boolean) => void;
  clear: () => void;
}

export const useAIChatStore = create<AIChatState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      messages: [WELCOME_MESSAGE],
      isProcessing: false,
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },
      addUserMessage: (content) => {
        get().addMessage({ role: "user", content, timestamp: new Date() });
      },
      addAIMessage: (content, commandExecuted) => {
        get().addMessage({
          role: "ai",
          content,
          timestamp: new Date(),
          commandExecuted,
        });
      },
      addErrorMessage: (
        error = "I encountered an error processing your request. Please try again."
      ) => {
        get().addMessage({ role: "ai", content: error, timestamp: new Date() });
      },
      setIsProcessing: (value) => set({ isProcessing: value }),
      clear: () => set({ messages: [WELCOME_MESSAGE], isProcessing: false }),
    })),
    {
      name: "ai-chat-store",
      version: 1,
      // Convert Date objects during persist/rehydrate
      partialize: (state) => ({ messages: state.messages }),
      merge: (persistedState: any, currentState) => {
        const messages = Array.isArray(persistedState?.messages)
          ? (persistedState.messages as ChatMessage[]).map((m) => ({
              ...m,
              // Ensure timestamp is a Date instance after rehydrate
              timestamp: new Date(m.timestamp as any),
            }))
          : currentState.messages;
        return { ...currentState, ...persistedState, messages } as AIChatState;
      },
    }
  )
);
