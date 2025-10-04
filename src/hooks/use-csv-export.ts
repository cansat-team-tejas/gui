import { useCallback } from "react";
import { useInfiniteCSVData } from "./use-infinite-csv-data";
import {
  exportToCsv,
  generateFilteredFilename,
  generateFullDataFilename,
} from "../utils/csv-export";
import { columns, ICanSatTelemetryData } from "../data/csv-data";
import { useWatch } from "react-hook-form";

export const useCSVExport = () => {
  const searchValue: string = useWatch({
    name: "searchTerm",
    defaultValue: "",
  });
  const searchColumnValue: string = useWatch({
    name: "searchColumn",
    defaultValue: "",
  });

  const { data: allData } = useInfiniteCSVData({
    searchTerm: searchValue,
    searchField: searchColumnValue
      ? (searchColumnValue as keyof ICanSatTelemetryData)
      : undefined,
  });

  const handleExport = useCallback(() => {
    if (allData.length === 0) {
      alert("No data available to export");
      return;
    }

    let filename: string;
    if (searchValue && searchColumnValue) {
      filename = generateFilteredFilename(searchColumnValue, searchValue);
    } else {
      filename = generateFullDataFilename();
    }

    exportToCsv(allData, columns, filename);
  }, [allData, searchValue, searchColumnValue]);

  return {
    handleExport,
    dataCount: allData.length,
  };
};
