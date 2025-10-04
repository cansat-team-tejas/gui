import { useEffect, useMemo, useRef, useState } from "react";
import { useTelemetryHistory } from "./use-xbee";
import { transformTelemetryToCSV } from "../utils/telemetry-helpers";
import { filterTelemetryData } from "../utils/data-processing";
import { ICanSatTelemetryData } from "../data/csv-data";

interface UseInfiniteCSVDataProps {
  searchTerm?: string;
  searchField?: keyof ICanSatTelemetryData;
  sortField?: keyof ICanSatTelemetryData;
  sortOrder?: "asc" | "desc";
}

export const useInfiniteCSVData = ({
  searchTerm = "",
  searchField,
  sortField,
  sortOrder = "desc",
}: UseInfiniteCSVDataProps = {}) => {
  const telemetryHistory = useTelemetryHistory();

  // Incremental state: map for O(1) dedup, array kept sorted desc by PACKET_COUNT
  const mapRef = useRef<Map<number, ICanSatTelemetryData>>(new Map());
  const listRef = useRef<ICanSatTelemetryData[]>([]);
  const [version, setVersion] = useState(0);

  // Track last processed length to apply only new items
  const lastLenRef = useRef(0);

  useEffect(() => {
    const newLen = telemetryHistory.length;

    // Reset if history shrank (e.g., GUI reset)
    if (newLen < lastLenRef.current) {
      mapRef.current.clear();
      listRef.current = [];
      lastLenRef.current = 0;
    }

    if (newLen === lastLenRef.current) return;

    const slice = telemetryHistory.slice(lastLenRef.current);
    lastLenRef.current = newLen;

    const transformed = transformTelemetryToCSV(slice);

    // Apply to map/list
    for (const item of transformed) {
      const key = item.PACKET_COUNT;
      const existing = mapRef.current.get(key);
      mapRef.current.set(key, item);

      if (!existing) {
        // Insert into correct position to keep desc order by PACKET_COUNT
        const arr = listRef.current;
        let lo = 0,
          hi = arr.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (arr[mid].PACKET_COUNT > key) lo = mid + 1;
          else hi = mid;
        }
        arr.splice(lo, 0, item);
      } else {
        // Update existing item in array as well
        const arr = listRef.current;
        const idx = arr.findIndex((r) => r.PACKET_COUNT === key);
        if (idx !== -1) arr[idx] = item;
      }
    }

    // Bump version to trigger memo below
    setVersion((v) => v + 1);
  }, [telemetryHistory]);

  // Optionally filter and sort (defaults to PACKET_COUNT desc already)
  const filteredSorted = useMemo(() => {
    const base = listRef.current;
    let out: ICanSatTelemetryData[] = base;

    if (searchTerm && searchField) {
      out = filterTelemetryData(base, searchTerm, searchField);
    }

    if (
      sortField &&
      sortField !== ("PACKET_COUNT" as keyof ICanSatTelemetryData)
    ) {
      const order = sortOrder === "asc" ? 1 : -1;
      const f = sortField as keyof ICanSatTelemetryData;
      out = [...out].sort((a, b) => {
        const av = a[f] as any;
        const bv = b[f] as any;
        if (typeof av === "number" && typeof bv === "number") {
          return order * (av - bv);
        }
        return order * String(av).localeCompare(String(bv));
      });
    }

    return out;
  }, [version, searchTerm, searchField, sortField, sortOrder]);

  // Provide a stable API for the table (no actual pagination needed)
  return {
    data: filteredSorted,
    totalRows: filteredSorted.length,
    isLoading: false,
    isError: false,
    error: null as null,
    fetchNextPage: async () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
  } as const;
};
