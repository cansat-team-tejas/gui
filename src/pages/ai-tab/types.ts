export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  commandExecuted?: string;
}

export const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ai",
  content:
    "Hello! I'm your CanSat Mission AI Assistant. I have access to all your telemetry data, logs, and can execute commands. Ask me anything about the mission or tell me what you'd like to do!",
  timestamp: new Date(),
};
