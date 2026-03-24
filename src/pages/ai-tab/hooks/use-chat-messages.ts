import { useAIChatStore } from "../../../store/ai-chat";
import type { ChatMessage } from "../types";

export const useChatMessages = () => {
  const messages = useAIChatStore((s) => s.messages) as ChatMessage[];
  const isProcessing = useAIChatStore((s) => s.isProcessing);
  const setIsProcessing = useAIChatStore((s) => s.setIsProcessing);
  const addUserMessage = useAIChatStore((s) => s.addUserMessage);
  const addAIMessage = useAIChatStore((s) => s.addAIMessage);
  const addErrorMessage = useAIChatStore((s) => s.addErrorMessage);

  return {
    messages,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
  };
};
