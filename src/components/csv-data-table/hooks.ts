import { useMemo } from "react";
import { ICanSatTelemetryData } from "../../data/csv-data";
import { TABLE_CONFIG } from "./constants";

export function useTableData(data: ICanSatTelemetryData[]) {
  return useMemo(() => {
    const isLargeDataset = data.length > TABLE_CONFIG.VISIBLE_ROWS_THRESHOLD;
    const visibleData = isLargeDataset
      ? data.slice(0, TABLE_CONFIG.BATCH_SIZE)
      : data;
    const remainingRows = isLargeDataset
      ? data.length - TABLE_CONFIG.BATCH_SIZE
      : 0;

    return {
      visibleData,
      remainingRows,
      isLargeDataset,
      totalRows: data.length,
    };
  }, [data]);
}
