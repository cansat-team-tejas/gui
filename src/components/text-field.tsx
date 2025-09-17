import React from "react";

interface TextFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  placeholder = "SEARCH",
  value,
  onChange,
  className = "",
}) => {
  return (
    <div
      className={`border border-black bg-white px-2 py-1 h-[25px] flex items-center hover:bg-gray-50 focus-within:ring-1 focus-within:ring-black ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="font-bold text-[10px] text-black bg-transparent border-none outline-none flex-1 placeholder:text-gray-500"
      />
      {value && (
        <button
          onClick={() => onChange?.("")}
          className="ml-1 text-gray-500 hover:text-black text-[12px] font-bold"
          title="Clear"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default TextField;
