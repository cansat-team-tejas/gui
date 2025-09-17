import React from "react";

interface DataStatusDisplayProps {
  filteredCount: number;
  totalCount: number;
  filterColumn?: string;
  searchTerm?: string;
}

const DataStatusDisplay: React.FC<DataStatusDisplayProps> = ({
  filteredCount,
  totalCount,
  filterColumn,
  searchTerm,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="bg-[#00AD57] text-white px-2 py-1 text-[10px] font-bold h-max">
        SHOWING {filteredCount} OF {totalCount} ROWS
      </div>
      {searchTerm && filterColumn && (
        <div className="bg-[#FFAB00] text-white px-2 py-1 text-[10px] font-bold h-max">
          FILTERED BY: {filterColumn.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default DataStatusDisplay;
