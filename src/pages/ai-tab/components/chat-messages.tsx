import React, { memo, useRef, useEffect } from "react";
import ChatMessageComponent from "./chat-message";
import type { ChatMessage } from "../types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isProcessing: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = memo(
  ({ messages, isProcessing }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, [messages.length, isProcessing]);

    return (
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-[#D9D9D9] text-black border border-black p-3 max-w-[80%]">
              <div className="text-[12px] flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00AD57] rounded-full animate-pulse" />
                <span className="font-bold">AI processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ChatMessages.displayName = "ChatMessages";

export default ChatMessages;
