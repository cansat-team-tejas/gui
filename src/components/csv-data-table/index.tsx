export interface TableColumn<T> {
  header: string;
  accessor: keyof T;
}

interface CsvDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
}

function CsvDataTable<T>({ data, columns }: CsvDataTableProps<T>) {
  return (
    <div className="max-h-full border border-black border-b-0">
      <div className="flex overflow-auto max-h-full">
        {columns.map((col) => (
          <div
            key={String(col.accessor)}
            className="flex flex-col min-w-[140px] border-r border-black last:border-r-0"
          >
            <div className="bg-[#D9D9D9] flex items-center justify-center h-[30px] px-2 py-1 border-b border-black text-[12px] font-bold text-black text-center sticky top-0">
              {col.header}
            </div>
            <div className="flex-1">
              {data.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="flex items-center justify-center h-[25px] px-2 py-1 border-b border-black text-[10px] font-bold text-black text-center bg-white hover:bg-gray-50 transition-colors"
                >
                  {String(row[col.accessor])}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CsvDataTable;
