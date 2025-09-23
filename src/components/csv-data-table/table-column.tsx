import { memo } from "react";
import { ICanSatTelemetryData, type TableColumn } from "../../data/csv-data";
import CsvTableCell from "../csv-table-cell";
import { useTableData } from "./hooks";

interface TableColumnProps {
  column: TableColumn;
  data: ICanSatTelemetryData[];
}

export const TableColumnComponent = memo<TableColumnProps>(
  ({ column, data }) => {
    const { visibleData, remainingRows } = useTableData(data);

    return (
      <div className="flex flex-col min-w-[140px] h-full border-r border-black last:border-r-0">
        <div className="bg-[#D9D9D9] flex items-center justify-center h-[30px] px-2 py-1 border-b border-black text-[12px] font-bold text-black text-center sticky top-0">
          {column.header}
        </div>

        <div className="flex-1">
          {visibleData.map((row, rowIdx) => (
            <CsvTableCell
              key={`${column.accessor}-${rowIdx}`}
              value={row[column.accessor]}
              fieldName={column.accessor}
            />
          ))}

          {remainingRows > 0 && (
            <div className="h-[30px] flex items-center justify-center text-[10px] text-gray-500 border-t border-gray-200">
              + {remainingRows} more rows
            </div>
          )}
        </div>
      </div>
    );
  }
);

TableColumnComponent.displayName = "TableColumnComponent";
