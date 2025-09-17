import React from "react";
import { useFormContext, FieldError } from "react-hook-form";

interface RhfDropdownProps {
  name: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
  label?: string;
}

const RhfDropdown: React.FC<RhfDropdownProps> = ({
  name,
  options,
  className = "",
  label,
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
      <select
        {...register(name)}
        className={`border border-black bg-white px-2 py-1 text-[10px] font-bold h-[25px] min-w-[100px] cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black ${
          error ? "border-red-500" : ""
        } ${className}`}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-black"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[8px] text-red-500 font-bold">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default RhfDropdown;
