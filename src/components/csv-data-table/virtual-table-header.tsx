/**
 * Virtual Table Header Component
 * Sticky header for virtual scrolling table
 */
import { memo } from "react";
import { TableColumn } from "../../data/csv-data";

interface VirtualTableHeaderProps {
  columns: TableColumn[];
  onColumnClick?: (column: TableColumn) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export const VirtualTableHeader = memo<VirtualTableHeaderProps>(
  ({ columns, onColumnClick, sortColumn, sortDirection }) => {
    return (
      <div className="flex bg-[#D9D9D9] border-b-2 border-black sticky top-0 z-10">
        {columns.map((column) => (
          <div
            key={String(column.accessor)}
            className={`min-w-[140px] flex-shrink-0 border-r border-black last:border-r-0 h-[30px] px-2 py-1 flex items-center justify-center transition-colors ${
              onColumnClick
                ? "cursor-pointer hover:bg-gray-300"
                : "cursor-default"
            }`}
            onClick={() => onColumnClick?.(column)}
            style={{ cursor: onColumnClick ? "pointer" : "default" }}
          >
            <span className="text-[12px] font-bold text-black text-center select-none">
              {column.header}
              {sortColumn === column.accessor && (
                <span className="ml-1 text-[10px]">
                  {sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    );
  }
);

VirtualTableHeader.displayName = "VirtualTableHeader";
