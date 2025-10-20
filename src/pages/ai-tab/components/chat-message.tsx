import React, { memo } from "react";
import type { ChatMessage } from "../types";

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

  // Function to parse and highlight **text** patterns and * bullet points
  const parseAndHighlight = (text: string) => {
    // First split by **text** pattern while preserving the delimiters
    const boldParts = text.split(/(\*\*[^*]+\*\*)/);

    return boldParts.map((part, boldIndex) => {
      // Check if this part is wrapped in **
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        // Remove ** from start and end, then make bold
        const boldText = part.slice(2, -2);
        return (
          <span key={boldIndex} className="font-bold">
            {boldText}
          </span>
        );
      }

      // For regular text, check for bullet points (single *)
      const bulletParts = part.split(/(\n\* )/);

      return bulletParts.map((bulletPart, bulletPartIndex) => {
        if (bulletPart === "\n* ") {
          // Replace bullet point marker with actual bullet
          return (
            <span key={`${boldIndex}-${bulletPartIndex}`}>
              <br />•
            </span>
          );
        }
        return (
          <span key={`${boldIndex}-${bulletPartIndex}`}>{bulletPart}</span>
        );
      });
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
          {parseAndHighlight(message.content)}
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
