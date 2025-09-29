/**
 * Virtual Table Controls Component
 * Search, pagination, and table controls
 */
import { memo } from "react";

interface VirtualTableControlsProps {
  totalRows: number;
  visibleRows: number;
  currentScrollIndex: number;
  searchTerm: string;
  onScrollToTop: () => void;
  onScrollToBottom: () => void;
  onScrollToIndex?: (index: number) => void;
}

export const VirtualTableControls = memo<VirtualTableControlsProps>(
  ({
    totalRows,
    visibleRows,
    currentScrollIndex,
    onScrollToTop,
    onScrollToBottom,
    onScrollToIndex,
  }) => {
    const handleGoToRow = () => {
      const input = prompt(`Go to row (1-${totalRows}):`);
      if (input) {
        const rowNumber = parseInt(input, 10);
        if (rowNumber >= 1 && rowNumber <= totalRows) {
          onScrollToIndex?.(rowNumber - 1);
        }
      }
    };

    return (
      <div className="flex items-center justify-between px-2 py-1 text-[10px] bg-gray-50 border-t border-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            Showing rows {currentScrollIndex + 1}-
            {Math.min(currentScrollIndex + visibleRows, totalRows)} of{" "}
            {totalRows}
          </span>
          {totalRows > 100 && (
            <span className="text-yellow-600 font-bold">
              (Virtual scrolling active)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onScrollToTop}
            className="px-2 py-1 bg-white border border-gray-400 hover:bg-gray-100 transition-colors rounded text-[9px] font-bold"
            title="Go to top"
          >
            ↑ TOP
          </button>

          {totalRows > 50 && (
            <button
              onClick={handleGoToRow}
              className="px-2 py-1 bg-white border border-gray-400 hover:bg-gray-100 transition-colors rounded text-[9px] font-bold"
              title="Go to specific row"
            >
              GO TO
            </button>
          )}

          <button
            onClick={onScrollToBottom}
            className="px-2 py-1 bg-white border border-gray-400 hover:bg-gray-100 transition-colors rounded text-[9px] font-bold"
            title="Go to bottom"
          >
            ↓ END
          </button>
        </div>
      </div>
    );
  }
);

VirtualTableControls.displayName = "VirtualTableControls";
