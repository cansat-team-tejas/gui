import { TableColumn, ICanSatTelemetryData } from "../data/csv-data";

export function exportToCsv(
  data: ICanSatTelemetryData[],
  columns: TableColumn[],
  filename: string = "data.csv"
): void {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    columns.map((col) => col.header).join(",") +
    "\n" +
    data
      .map((row) => columns.map((col) => String(row[col.accessor])).join(","))
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateFilteredFilename(
  searchColumn: string,
  searchTerm: string,
  baseFilename: string = "filtered_data"
): string {
  return `${baseFilename}_${searchColumn}_${searchTerm}.csv`;
}

export function generateFullDataFilename(): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-");
  return `csv_data_export_${timestamp}.csv`;
}
