import { useMemo, useCallback } from "react";
import { TableColumnComponent } from "./table-column";
import { useWatch } from "react-hook-form";
import { ICanSatTelemetryData, columns } from "../../data/csv-data";
import { useTelemetryHistory } from "../../hooks/use-xbee";
import { transformTelemetryToCSV } from "../../utils/telemetry-helpers";
import { filterTelemetryData } from "../../utils/data-processing";

function CsvDataTable() {
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

  // Memoize columns to prevent re-renders
  const memoizedColumns = useMemo(() => columns, []);

  // Memoized render function for columns
  const renderColumn = useCallback(
    (col: (typeof columns)[0]) => (
      <TableColumnComponent
        key={String(col.accessor)}
        column={col}
        data={filteredData}
      />
    ),
    [filteredData]
  );

  return (
    <div className="max-h-full border border-black border-b overflow-hidden">
      <div className="flex overflow-auto max-h-full">
        {memoizedColumns.map(renderColumn)}
      </div>
    </div>
  );
}

export default CsvDataTable;
