import React from "react";
import { useFormContext, FieldError } from "react-hook-form";

interface RhfTextFieldProps {
  name: string;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  type?: "text" | "number" | "email" | "password";
}

const RhfTextField: React.FC<RhfTextFieldProps> = ({
  name,
  placeholder = "SEARCH",
  className = "",
  label,
  disabled = false,
  type = "text",
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name] as FieldError | undefined;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-bold text-black">{label}</label>
      )}
      <div
        className={`border border-black bg-white px-2 py-1 h-[25px] flex items-center hover:bg-gray-50 focus-within:ring-1 focus-within:ring-black ${
          error ? "border-red-500" : ""
        } ${
          disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""
        } ${className}`}
      >
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className="font-bold text-[10px] text-black bg-transparent border-none outline-none flex-1 placeholder:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>
      {error && (
        <span className="text-[8px] text-red-500 font-bold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default RhfTextField;
