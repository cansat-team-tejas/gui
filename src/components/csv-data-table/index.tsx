import { useMemo, useCallback } from "react";
import { TableColumnComponent } from "./table-column";
import { VirtualCsvDataTable } from "./virtual-csv-data-table";
import { useWatch } from "react-hook-form";
import { ICanSatTelemetryData, columns } from "../../data/csv-data";
import { useTelemetryHistory } from "../../hooks/use-xbee";
import { transformTelemetryToCSV } from "../../utils/telemetry-helpers";
import { filterTelemetryData } from "../../utils/data-processing";
import { TABLE_CONFIG } from "./constants";

interface CsvDataTableProps {
  sortingEnabled: boolean;
  sortColumn: keyof ICanSatTelemetryData | null;
  sortDirection: "asc" | "desc";
  onSort: (column: keyof ICanSatTelemetryData) => void;
}

function CsvDataTable({
  sortingEnabled,
  sortColumn,
  sortDirection,
  onSort,
}: CsvDataTableProps) {
  const searchTerm = useWatch({ name: "searchTerm" }) as string;
  const searchColumn = useWatch({
    name: "searchColumn",
  }) as keyof ICanSatTelemetryData;
  const telemetryHistory = useTelemetryHistory();

  // Memoize the transformed CSV data
  const csvData = useMemo(() => {
    return transformTelemetryToCSV(telemetryHistory);
  }, [telemetryHistory]);

  // Memoize the filtered data
  const filteredData = useMemo(() => {
    return filterTelemetryData(csvData, searchTerm, searchColumn);
  }, [csvData, searchTerm, searchColumn]);

  // Sort the filtered data (only if sorting is enabled)
  const sortedData = useMemo(() => {
    if (!sortingEnabled || !sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? -1 : 1;
      if (bVal == null) return sortDirection === "asc" ? 1 : -1;

      // Convert to numbers if both values are numeric
      const aNum = Number(aVal);
      const bNum = Number(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Handle sort
  const handleSort = useCallback(
    (column: keyof ICanSatTelemetryData) => {
      if (sortingEnabled) {
        onSort(column);
      }
    },
    [onSort, sortingEnabled]
  );

  // Determine if we should use virtual scrolling
  const shouldUseVirtualScrolling =
    sortedData.length > TABLE_CONFIG.VISIBLE_ROWS_THRESHOLD;

  // Memoize columns to prevent re-renders
  const memoizedColumns = useMemo(() => columns, []);

  // Memoized render function for columns (legacy table)
  const renderColumn = useCallback(
    (col: (typeof columns)[0]) => (
      <TableColumnComponent
        key={String(col.accessor)}
        column={col}
        data={sortedData.slice(0, TABLE_CONFIG.BATCH_SIZE)} // Show only batch size for performance
      />
    ),
    [sortedData]
  );

  // Performance message for users
  const performanceInfo = useMemo(() => {
    if (shouldUseVirtualScrolling) {
      return `🚀 Virtual scrolling: ${sortedData.length.toLocaleString()} rows`;
    } else if (
      sortedData.length > TABLE_CONFIG.BATCH_SIZE &&
      !shouldUseVirtualScrolling
    ) {
      return `📄 Showing ${
        TABLE_CONFIG.BATCH_SIZE
      } of ${sortedData.length.toLocaleString()} rows`;
    }
    return `📊 ${sortedData.length.toLocaleString()} rows`;
  }, [sortedData.length, shouldUseVirtualScrolling]);

  if (shouldUseVirtualScrolling) {
    return (
      <div className="flex flex-col max-h-full border border-black overflow-hidden">
        {/* Performance indicator */}
        <div className="px-2 py-1 bg-blue-50 border-b border-blue-200 text-[10px] text-blue-700 font-medium">
          {performanceInfo} • Virtual scrolling enabled for optimal performance
        </div>

        <VirtualCsvDataTable
          data={sortedData}
          sortColumn={sortingEnabled ? sortColumn : null}
          sortDirection={sortDirection}
          onSort={sortingEnabled ? handleSort : undefined}
          searchTerm={searchTerm}
          className="flex-1"
          enableSorting={sortingEnabled}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-full border border-black border-b overflow-hidden">
      {/* Performance indicator */}
      <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 text-[10px] text-gray-600">
        {performanceInfo}
      </div>

      <div className="flex overflow-auto max-h-full">
        {memoizedColumns.map(renderColumn)}
      </div>
    </div>
  );
}

export default CsvDataTable;
