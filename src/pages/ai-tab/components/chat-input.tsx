import React, { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../../components/button";

const chatInputSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
});

type ChatInputData = z.infer<typeof chatInputSchema>;

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(
  ({ onSendMessage, isProcessing }) => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isValid },
      watch,
    } = useForm<ChatInputData>({
      resolver: zodResolver(chatInputSchema),
      defaultValues: {
        message: "",
      },
      mode: "onChange",
    });

    const messageValue = watch("message");

    const onSubmit = (data: ChatInputData) => {
      onSendMessage(data.message);
      reset();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-black p-4"
      >
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <textarea
              {...register("message")}
              onKeyPress={handleKeyPress}
              placeholder="Ask about mission status, request commands, or get insights..."
              className="w-full border border-black p-2 text-[12px] resize-none h-[80px] focus:outline-none focus:ring-1 focus:ring-[#00AD57]"
              disabled={isProcessing}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-[9px] text-gray-500">
                Press Enter to send • Shift+Enter for new line
              </div>
              {errors.message && (
                <div className="text-[9px] text-red-500">
                  {errors.message.message}
                </div>
              )}
              <div className="text-[9px] text-gray-400">
                {messageValue?.length || 0}/1000
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!isValid || isProcessing || !messageValue?.trim()}
            variant="success"
            className="h-[80px] px-6 self-start"
          >
            {isProcessing ? "SENDING..." : "SEND"}
          </Button>
        </div>
      </form>
    );
  }
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
