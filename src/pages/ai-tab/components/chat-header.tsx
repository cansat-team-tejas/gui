import React, { memo } from "react";

interface ChatHeaderProps {
  isConnected: boolean;
  messageCount: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = memo(
  ({ isConnected, messageCount }) => {
    return (
      <div className="border border-b-black border-t-black text-[13px] font-bold px-2 py-1 bg-[#D9D9D9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>AI MISSION ASSISTANT</span>
            <span className="text-[10px]">•</span>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-[#00AD57]" : "bg-[#FFAB00]"
                }`}
              />
              <span className="text-[10px]">
                {isConnected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
          </div>
          <div className="text-[10px]">MSGS: {messageCount}</div>
        </div>
      </div>
    );
  }
);

ChatHeader.displayName = "ChatHeader";

export default ChatHeader;
