import { useMemo } from "react";

interface UseDataFilterProps<T> {
  data: T[];
  searchTerm: string;
  searchColumn: keyof T;
}

interface UseDataFilterReturn<T> {
  filteredData: T[];
  filteredCount: number;
  totalCount: number;
}

export function useDataFilter<T>({
  data,
  searchTerm,
  searchColumn,
}: UseDataFilterProps<T>): UseDataFilterReturn<T> {
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter((row) => {
      const value = row[searchColumn];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchColumn]);

  return {
    filteredData,
    filteredCount: filteredData.length,
    totalCount: data.length,
  };
}
