import React from "react";

interface AIServiceConfigProps {
  port: number;
  onPortChange: (port: number) => void;
}

const AIServiceConfig: React.FC<AIServiceConfigProps> = ({
  port,
  onPortChange,
}) => {
  return (
    <div className="border border-black bg-white p-2">
      <div className="text-[10px] font-bold mb-2">AI SERVICE</div>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-bold min-w-[140px]">PORT</label>
        <input
          type="number"
          value={port}
          onChange={(e) => onPortChange(Number(e.target.value))}
          className="border border-black px-2 py-1 text-[10px] font-bold h-[25px] w-[120px]"
        />
        <div className="text-[10px] text-gray-600">e.g. 8000</div>
      </div>
    </div>
  );
};

export default AIServiceConfig;
