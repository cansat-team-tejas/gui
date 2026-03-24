import React, { useCallback } from "react";
import ChatMessages from "./components/chat-messages";
import ChatInput from "./components/chat-input";
import { useMissionContext } from "./hooks/use-mission-context";
import { useAIService } from "./hooks/use-ai-service";
import { useChatMessages } from "./hooks/use-chat-messages";
import Button from "../../components/button";
import { useAIChatStore } from "../../store/ai-chat";
import ConfirmationDialog from "../../components/confirmation-dialog";
import { useSettingsState, useCommandManagement } from "../settings/hooks";

const AITab: React.FC = () => {
  const missionContext = useMissionContext();
  const { processAIResponse } = useAIService();
  const settingsState = useSettingsState();
  const { handleConfirmCommand, handleCancelCommand } =
    useCommandManagement(settingsState);

  const {
    messages,
    isProcessing,
    setIsProcessing,
    addUserMessage,
    addAIMessage,
    addErrorMessage,
  } = useChatMessages();
  // Access clear method from store for reset
  const clearChat = useAIChatStore((s) => s.clear);

  const handleSendMessage = useCallback(
    async (message: string) => {
      addUserMessage(message);
      setIsProcessing(true);

      try {
        const { response, commandExecuted, sql, rowCount } = await processAIResponse(
          message,
          missionContext
        );
        addAIMessage(response, commandExecuted, sql, rowCount);
        if (!commandExecuted) return;

        settingsState.setConfirmationState({
          isOpen: commandExecuted ? true : false,
          command: commandExecuted,
          timeoutId: null,
          timeRemaining: 30,
        });
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

  return (
    <section aria-label="AI Mission Assistant">
      <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-end px-4 pt-2 pb-1 w-full">
          <Button
            variant="warning"
            className="text-[10px] px-2 py-1 h-[24px]"
            onClick={clearChat}
            title="Clear conversation"
          >
            Reset
          </Button>
        </div>
        <ChatMessages messages={messages} isProcessing={isProcessing} />
        <ChatInput
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
        />
      </div>

      {/* AI Command Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={settingsState.confirmationState.isOpen}
        title="AI COMMAND CONFIRMATION"
        message={
          settingsState.confirmationState.command
            ? `The AI assistant wants to execute the command: ${settingsState.confirmationState.command}\n\nThis command will be sent to the CanSat immediately upon confirmation.`
            : ""
        }
        confirmText={`SEND COMMAND (${settingsState.confirmationState.timeRemaining}s)`}
        cancelText="CANCEL"
        onConfirm={handleConfirmCommand}
        onCancel={handleCancelCommand}
        isDangerous={true}
      />
    </section>
  );
};

export default AITab;
