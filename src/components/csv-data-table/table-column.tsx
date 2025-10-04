import { memo } from "react";
import { ICanSatTelemetryData, type TableColumn } from "../../data/csv-data";
import CsvTableCell from "../csv-table-cell";

interface TableColumnProps {
  column: TableColumn;
  data: ICanSatTelemetryData[];
  // Optional spacers to align with virtualized window
  topSpacer?: number;
  bottomSpacer?: number;
  // Start index in the full data set (for stable keys)
  startIndex?: number;
}

export const TableColumnComponent = memo<TableColumnProps>(
  ({ column, data, topSpacer = 0, bottomSpacer = 0, startIndex = 0 }) => {
    return (
      <div className="flex flex-col min-w-[140px] h-full border-r border-black last:border-r-0 flex-shrink-0">
        <div className="bg-[#D9D9D9] flex items-center justify-center h-[30px] px-2 py-1 border-b border-black text-[12px] font-bold text-black text-center sticky top-0 z-10">
          {column.header}
        </div>

        <div className="flex-1 min-h-0">
          {topSpacer > 0 && <div style={{ height: topSpacer }} />}

          {data.map((row, rowIdx) => (
            <CsvTableCell
              key={`${column.accessor}-${startIndex + rowIdx}`}
              value={row[column.accessor]}
              fieldName={column.accessor}
            />
          ))}

          {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}
        </div>
      </div>
    );
  }
);

TableColumnComponent.displayName = "TableColumnComponent";
