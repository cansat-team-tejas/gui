import type { ITelemetryType } from "../types/telemetry";

export const filterTelemetryData = (
  data: ITelemetryType[],
  searchTerm: string,
  searchColumn: keyof ITelemetryType
): ITelemetryType[] => {
  if (!searchTerm.trim()) return data;

  return data.filter((row) => {
    const value = row[searchColumn];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });
};

export const formatMissionTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};
