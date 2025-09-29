import React, { memo } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  commandExecuted?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = memo(({ message }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] p-3 ${
          message.role === "user"
            ? "bg-[#00AD57] text-white border border-black"
            : "bg-white text-black border border-black"
        }`}
      >
        <div className="text-[12px] leading-relaxed whitespace-pre-wrap font-medium">
          {message.content}
        </div>
        <div className="flex items-center justify-between mt-2 gap-2">
          <div
            className={`text-[9px] font-bold ${
              message.role === "user" ? "text-green-100" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
          {message.commandExecuted && (
            <div className="bg-[#FFAB00] text-black px-2 py-1 text-[8px] font-bold border border-black">
              CMD: {message.commandExecuted}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatMessageComponent.displayName = "ChatMessageComponent";

export default ChatMessageComponent;
