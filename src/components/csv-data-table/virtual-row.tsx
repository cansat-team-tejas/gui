/**
 * Virtual Row Component
 * Renders individual rows in virtual table
 */
import { memo } from "react";
import { ICanSatTelemetryData, TableColumn } from "../../data/csv-data";
import CsvTableCell from "../csv-table-cell";

interface VirtualRowProps {
  rowData: ICanSatTelemetryData;
  columns: TableColumn[];
  rowIndex: number;
  style?: React.CSSProperties;
}

export const VirtualRow = memo<VirtualRowProps>(
  ({ rowData, columns, rowIndex, style }) => {
    return (
      <div
        className="flex border-b border-gray-200 hover:bg-gray-50"
        style={style}
        data-row-index={rowIndex}
      >
        {columns.map((column) => (
          <div
            key={String(column.accessor)}
            className="min-w-[140px] flex-shrink-0 border-r border-black last:border-r-0"
          >
            <CsvTableCell
              value={rowData[column.accessor]}
              fieldName={column.accessor}
            />
          </div>
        ))}
      </div>
    );
  }
);

VirtualRow.displayName = "VirtualRow";
