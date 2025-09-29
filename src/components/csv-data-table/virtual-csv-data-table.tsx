/**
 * Virtual CSV Data Table Component
 * High-performance table for large telemetry datasets using virtual scrolling
 */
import { memo, useMemo, useCallback, useEffect, useState } from "react";
import {
  useVirtualScroll,
  useVirtualScrollContainer,
} from "../../hooks/use-virtual-scroll";
import { VirtualTableHeader } from "./virtual-table-header";
import { VirtualRow } from "./virtual-row";
import { VirtualTableControls } from "./virtual-table-controls";
import { columns } from "../../data/csv-data";
import type { ICanSatTelemetryData } from "../../data/csv-data";

interface VirtualCsvDataTableProps {
  data: ICanSatTelemetryData[];
  sortColumn: keyof ICanSatTelemetryData | null;
  sortDirection: "asc" | "desc";
  onSort?: (column: keyof ICanSatTelemetryData) => void;
  searchTerm?: string;
  className?: string;
  enableSorting?: boolean;
}

const ITEM_HEIGHT = 32; // Height of each row in pixels
const OVERSCAN = 5; // Extra items to render outside visible area

export const VirtualCsvDataTable = memo<VirtualCsvDataTableProps>(
  ({
    data,
    sortColumn,
    sortDirection,
    onSort,
    searchTerm = "",
    className = "",
    enableSorting = false,
  }) => {
    // Dynamic container height calculation
    const [containerHeight, setContainerHeight] = useState(400);

    useEffect(() => {
      // Calculate dynamic height based on viewport
      const calculateHeight = () => {
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - 200; // Account for header, controls, etc.
        setContainerHeight(Math.max(300, Math.min(800, availableHeight)));
      };

      calculateHeight();
      window.addEventListener("resize", calculateHeight);

      return () => window.removeEventListener("resize", calculateHeight);
    }, []);
    // Filter data based on search term
    const filteredData = useMemo(() => {
      if (!searchTerm.trim()) return data;

      const term = searchTerm.toLowerCase();
      return data.filter((row) =>
        Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(term)
        )
      );
    }, [data, searchTerm]);

    // Virtual scrolling hook
    const [virtualResult, updateScrollTop] = useVirtualScroll(
      filteredData.length,
      {
        itemHeight: ITEM_HEIGHT,
        containerHeight,
        overscan: OVERSCAN,
      }
    );

    // Virtual scroll container hook
    const {
      containerRef,
      handleScroll,
      scrollToIndex,
      scrollToTop,
      scrollToBottom,
    } = useVirtualScrollContainer(updateScrollTop);

    // Navigation handlers
    const handleScrollToTop = useCallback(() => {
      scrollToTop();
    }, [scrollToTop]);

    const handleScrollToBottom = useCallback(() => {
      scrollToBottom();
    }, [scrollToBottom]);

    const handleScrollToIndex = useCallback(
      (index: number) => {
        scrollToIndex(index, ITEM_HEIGHT);
      },
      [scrollToIndex]
    );

    // Update scroll state when container scrolls
    const onScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        handleScroll(e);
      },
      [handleScroll]
    );

    // Handle column sort
    const handleColumnClick = useCallback(
      (column: (typeof columns)[0]) => {
        if (enableSorting && onSort) {
          onSort(column.accessor);
        }
      },
      [onSort, enableSorting]
    );

    // Render visible rows
    const visibleItems = useMemo(() => {
      const items = [];
      for (
        let i = virtualResult.visibleStartIndex;
        i <= virtualResult.visibleEndIndex;
        i++
      ) {
        if (i < filteredData.length) {
          items.push(
            <VirtualRow
              key={`${filteredData[i].MISSION_TIME_S}_${i}`}
              rowData={filteredData[i]}
              rowIndex={i}
              columns={columns}
              style={{
                position: "absolute",
                top: i * ITEM_HEIGHT,
                height: ITEM_HEIGHT,
                width: "100%",
              }}
            />
          );
        }
      }
      return items;
    }, [
      filteredData,
      virtualResult.visibleStartIndex,
      virtualResult.visibleEndIndex,
    ]);

    // Performance indicators
    const isLargeDataset = filteredData.length > 1000;

    return (
      <div className={`flex flex-col h-full ${className}`}>
        {/* Performance indicator */}
        {isLargeDataset && (
          <div className="px-2 py-1 bg-green-50 border border-green-200 text-[10px] text-green-700">
            🚀 High-performance mode active: Handling{" "}
            {filteredData.length.toLocaleString()} rows efficiently
          </div>
        )}

        {/* Header */}
        <VirtualTableHeader
          columns={columns}
          sortColumn={
            enableSorting && sortColumn ? String(sortColumn) : undefined
          }
          sortDirection={sortDirection}
          onColumnClick={enableSorting ? handleColumnClick : undefined}
        />

        {/* Virtual scroll container */}
        <div
          ref={containerRef}
          className="overflow-auto border-l border-r border-black bg-white"
          onScroll={onScroll}
          style={{
            height: containerHeight,
            scrollbarWidth: "thin",
          }}
        >
          {/* Virtual content container */}
          <div
            style={{
              height: virtualResult.totalHeight,
              position: "relative",
            }}
          >
            {/* Visible items */}
            <div
              style={{
                transform: `translateY(${virtualResult.offsetY}px)`,
              }}
            >
              {visibleItems}
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <VirtualTableControls
          totalRows={filteredData.length}
          visibleRows={virtualResult.visibleItems}
          currentScrollIndex={virtualResult.visibleStartIndex}
          searchTerm={searchTerm}
          onScrollToTop={handleScrollToTop}
          onScrollToBottom={handleScrollToBottom}
          onScrollToIndex={handleScrollToIndex}
        />

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "No telemetry data available"}
          </div>
        )}
      </div>
    );
  }
);

VirtualCsvDataTable.displayName = "VirtualCsvDataTable";
