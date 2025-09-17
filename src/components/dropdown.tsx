import React from "react";

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  className = "",
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-black bg-white px-2 py-1 text-[10px] font-bold h-[25px] min-w-[100px] cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black ${className}`}
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
  );
};

export default Dropdown;
