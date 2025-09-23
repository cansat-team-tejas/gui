/**
 * QNH Control Component
 * Handles QNH pressure setting using RHF and Zod
 */
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RhfTextField from "../../../components/rhf-text-field";
import { qnhSchema, QnhFormData } from "../schemas";
import { QNH_DEFAULTS } from "../constants";

interface QnhControlProps {
  onQnhSet: (qnhValue: string) => void;
}

const QnhControl: React.FC<QnhControlProps> = ({ onQnhSet }) => {
  const methods = useForm<QnhFormData>({
    resolver: zodResolver(qnhSchema),
    defaultValues: {
      qnh: QNH_DEFAULTS.DEFAULT_VALUE,
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = methods;

  const onSubmit = async (data: QnhFormData) => {
    await onQnhSet(data.qnh);
  };

  const handleSetClick = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <FormProvider {...methods}>
      <div className="flex gap-2 flex-col">
        <div className="flex gap-2">
          <div className="flex-1">
            <RhfTextField
              name="qnh"
              type="number"
              placeholder="QNH"
              className="bg-white border border-[rgba(0,0,0,0.58)] rounded-[2px] px-2 py-[6px] h-[32px] w-[100px] text-[13px] font-medium text-[rgba(0,0,0,0.65)]"
            />
          </div>
          <button
            type="button"
            onClick={handleSetClick}
            disabled={isSubmitting}
            className={`rounded-[2px] px-2 py-[6px] h-[32px] w-[80px] text-[13px] font-medium transition-colors ${
              isSubmitting
                ? "bg-[#D9D9D9] text-black cursor-not-allowed"
                : "bg-[rgba(217,217,217,0.5)] border border-[rgba(0,0,0,0.58)] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(217,217,217,0.8)]"
            }`}
            title={`QNH:${getValues("qnh")}`}
          >
            {isSubmitting ? "SETTING..." : "SET QNH"}
          </button>
        </div>

        {/* Display validation errors */}
        {errors.qnh && (
          <div className="text-red-600 text-[9px] font-bold">
            {errors.qnh.message}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default QnhControl;
