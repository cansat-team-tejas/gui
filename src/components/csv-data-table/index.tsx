import React, { useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TableColumnComponent } from "./table-column";
import { useWatch } from "react-hook-form";
import { ICanSatTelemetryData, columns } from "../../data/csv-data";
import { useInfiniteCSVData } from "../../hooks/use-infinite-csv-data";
import { throttle } from "lodash";

interface CsvDataTableProps {}

const MemoizedTableColumnComponent = React.memo(TableColumnComponent);

function CsvDataTable({}: CsvDataTableProps) {
  const searchValue: string = useWatch({
    name: "searchTerm",
    defaultValue: "",
  });
  const searchColumnValue: string = useWatch({
    name: "searchColumn",
    defaultValue: "",
  });

  const {
    data: allData,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteCSVData({
    searchTerm: searchValue,
    searchField: searchColumnValue
      ? (searchColumnValue as keyof ICanSatTelemetryData)
      : undefined,
    // No column sorting here; hook enforces newest-first by default
  });

  const parentRef = useRef<HTMLDivElement>(null);

  // Stable row height to match design system cell height (CsvTableCell uses h-[25px] + 1px border)
  const rowHeight = 26;

  const rowVirtualizer = useVirtualizer({
    count: allData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  });

  const loadMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const onScroll = useCallback(
    throttle(() => {
      if (!parentRef.current) return;
      const { scrollHeight, clientHeight, scrollTop } = parentRef.current;
      if (scrollTop + clientHeight > scrollHeight * 0.7) {
        loadMore();
      }
    }, 200),
    [loadMore]
  );

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">Error loading data</div>
      </div>
    );
  }

  // Compute visible window and spacers every render; provide a fallback on first mount
  const vItems = rowVirtualizer.getVirtualItems();
  let sliceStart = vItems[0]?.index ?? 0;
  let sliceEnd = vItems.length ? vItems[vItems.length - 1]!.index : -1;
  let sliceLen = sliceEnd >= sliceStart ? sliceEnd - sliceStart + 1 : 0;

  // Fallback when virtualizer hasn't measured yet (e.g., after tab switch)
  if (vItems.length === 0 && allData.length > 0) {
    sliceStart = 0;
    const viewport = parentRef.current?.clientHeight ?? 400;
    sliceLen = Math.min(allData.length, Math.ceil(viewport / rowHeight) + 10);
    sliceEnd = sliceStart + sliceLen - 1;
  }

  const visibleSlice: ICanSatTelemetryData[] =
    sliceLen > 0 ? allData.slice(sliceStart, sliceStart + sliceLen) : [];

  const topSpacer =
    vItems[0]?.start ?? (sliceStart > 0 ? sliceStart * rowHeight : 0);
  const lastEnd = vItems.length
    ? vItems[vItems.length - 1]!.end
    : (sliceEnd + 1) * rowHeight;
  const bottomSpacer = Math.max(rowVirtualizer.getTotalSize() - lastEnd, 0);

  return (
    <div className="flex flex-col h-full border border-black overflow-hidden">
      <div
        ref={parentRef}
        className="overflow-auto flex-1 min-h-0"
        onScroll={onScroll}
      >
        <div className="flex">
          {columns.map((column) => (
            <MemoizedTableColumnComponent
              key={String(column.accessor)}
              column={column}
              data={visibleSlice as ICanSatTelemetryData[]}
              topSpacer={topSpacer}
              bottomSpacer={bottomSpacer}
              startIndex={sliceStart}
            />
          ))}
        </div>
      </div>

      <div className="px-2 py-1 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-600 flex justify-between">
        <span>Rows loaded: {allData.length}</span>
      </div>
    </div>
  );
}

export default CsvDataTable;
