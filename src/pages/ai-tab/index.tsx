import React, { useCallback } from "react";
import ChatHeader from "./components/chat-header";
import ChatMessages from "./components/chat-messages";
import ChatInput from "./components/chat-input";
import QuickActions from "./components/quick-actions";
import { useMissionContext } from "./hooks/use-mission-context";
import { useAIService } from "./hooks/use-ai-service";
import { useChatMessages } from "./hooks/use-chat-messages";

const AITab: React.FC = () => {
  const missionContext = useMissionContext();
  const { processAIResponse } = useAIService();
  const {
    messages,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
  } = useChatMessages();

  const handleSendMessage = useCallback(
    async (message: string) => {
      addUserMessage(message);
      setIsProcessing(true);

      try {
        const { response, commandExecuted } = await processAIResponse(
          message,
          missionContext
        );
        addAIMessage(response, commandExecuted);
      } catch (error) {
        console.error("AI processing error:", error);
        addErrorMessage();
      } finally {
        setIsProcessing(false);
      }
    },
    [
      missionContext,
      processAIResponse,
      addUserMessage,
      addAIMessage,
      addErrorMessage,
      setIsProcessing,
    ]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      if (!isProcessing) {
        handleSendMessage(action);
      }
    },
    [handleSendMessage, isProcessing]
  );

  return (
    <section about="AI Mission Assistant">
      <div className="h-full flex flex-col bg-white">
        <ChatHeader
          isConnected={missionContext.isConnected}
          messageCount={messages.length - 1}
        />

        <ChatMessages messages={messages} isProcessing={isProcessing} />

        <ChatInput
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
        />

        <QuickActions
          onActionSelect={handleQuickAction}
          isProcessing={isProcessing}
        />
      </div>
    </section>
  );
};

export default AITab;
