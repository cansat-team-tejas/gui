import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RhfTextField from "../../../components/rhf-text-field";
import { customCommandSchema, CustomCommandFormData } from "../schemas";

interface CustomCommandControlProps {
  commandStatus: string;
  onSendCommand: (command: string) => void;
}

const CustomCommandControl: React.FC<CustomCommandControlProps> = ({
  commandStatus,
  onSendCommand,
}) => {
  const methods = useForm<CustomCommandFormData>({
    resolver: zodResolver(customCommandSchema),
    defaultValues: {
      command: "",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: CustomCommandFormData) => {
    await onSendCommand(data.command);
    reset(); // Clear form after successful submission
  };

  return (
    <div className="space-y-2">
      {/* Command Status */}
      {commandStatus && (
        <div className="text-[10px] font-bold text-black bg-[#D9D9D9] p-1 border border-black">
          {commandStatus}
        </div>
      )}

      {/* Custom Command Form */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="text-[10px] font-bold">CUSTOM COMMAND</div>
          <div className="flex gap-2">
            <RhfTextField
              name="command"
              placeholder="ENTER COMMAND..."
              className="flex-1 border border-black bg-white px-2 py-1 text-[10px] font-bold h-[25px]"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-1 text-[10px] font-bold h-[25px] text-white ${
                isSubmitting
                  ? "bg-[#D9D9D9] text-black cursor-not-allowed"
                  : "bg-[#FFAB00] hover:bg-[#e09900]"
              }`}
            >
              {isSubmitting ? "SENDING..." : "SEND"}
            </button>
          </div>

          {/* Display validation errors */}
          {errors.command && (
            <div className="text-red-600 text-[9px] font-bold">
              {errors.command.message}
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default CustomCommandControl;
