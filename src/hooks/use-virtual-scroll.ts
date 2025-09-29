/**
 * Virtual Scrolling Hook
 * Manages virtual scrolling state and calculations
 */
import { useState, useMemo, useCallback, useRef } from "react";

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  scrollTop: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  totalHeight: number;
  offsetY: number;
  visibleItems: number;
}

export function useVirtualScroll(
  itemCount: number,
  config: VirtualScrollConfig
): [VirtualScrollResult, (scrollTop: number) => void] {
  const { itemHeight, containerHeight, overscan = 3 } = config;
  const [scrollTop, setScrollTop] = useState(0);

  const virtualResult = useMemo(() => {
    if (itemCount === 0) {
      return {
        scrollTop: 0,
        visibleStartIndex: 0,
        visibleEndIndex: 0,
        totalHeight: 0,
        offsetY: 0,
        visibleItems: 0,
      };
    }

    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItems, itemCount - 1);

    // Add overscan for smooth scrolling
    const visibleStartIndex = Math.max(0, startIndex - overscan);
    const visibleEndIndex = Math.min(itemCount - 1, endIndex + overscan);

    const totalHeight = itemCount * itemHeight;
    const offsetY = visibleStartIndex * itemHeight;

    return {
      scrollTop,
      visibleStartIndex,
      visibleEndIndex,
      totalHeight,
      offsetY,
      visibleItems: visibleEndIndex - visibleStartIndex + 1,
    };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const updateScrollTop = useCallback((newScrollTop: number) => {
    setScrollTop(Math.max(0, newScrollTop));
  }, []);

  return [virtualResult, updateScrollTop];
}

/**
 * Virtual Scroll Container Hook
 * Manages scroll events and container ref
 */
export function useVirtualScrollContainer(
  onScroll: (scrollTop: number) => void
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      onScroll(target.scrollTop);
    },
    [onScroll]
  );

  const scrollToIndex = useCallback((index: number, itemHeight: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return {
    containerRef,
    handleScroll,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  };
}
