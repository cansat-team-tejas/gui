import React from "react";

interface AIServiceConfigProps {
  port: number | string;
  onPortChange: (port: number | string) => void;
}

const AIServiceConfig: React.FC<AIServiceConfigProps> = ({
  port,
  onPortChange,
}) => {
  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">AI SERVICE</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold min-w-[140px]">BASE URL / PORT</label>
          <input
            type="text"
            value={port}
            onChange={(e) => {
              const val = e.target.value;
              // If it's a simple number, pass as number, otherwise string
              onPortChange(isNaN(Number(val)) || val === "" ? val : Number(val));
            }}
            className="border border-black px-2 py-1 text-[10px] font-bold h-[25px] flex-1"
          />
        </div>
        <div className="text-[10px] text-gray-500 italic">
          Default from .env or 8000
        </div>
      </div>
    </div>
  );
};

export default AIServiceConfig;
