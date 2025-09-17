import { useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SearchForm from "../../components/csv-search-form";
import CsvDataTable from "../../components/csv-data-table";
import DataStatusDisplay from "../../components/data-status-display";
import { useDataFilter } from "../../hooks/useDataFilter";
import {
  exportToCsv,
  generateFilteredFilename,
  generateFullDataFilename,
} from "../../utils/csv-export";
import { IDataRowType, columns, mockData } from "../../data/csv-data";

// Define validation schema
const searchSchema = z.object({
  searchTerm: z.string(),
  searchColumn: z.string(),
});

export type SearchFormData = z.infer<typeof searchSchema>;

const CSVTab = () => {
  const methods = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: "",
      searchColumn: "state",
    },
  });

  const searchTerm = methods.watch("searchTerm");
  const searchColumn = methods.watch("searchColumn") as keyof IDataRowType;

  const { filteredData, filteredCount, totalCount } = useDataFilter({
    data: mockData,
    searchTerm,
    searchColumn,
  });

  const searchColumnOptions = columns.map((col) => ({
    value: col.accessor,
    label: col.header,
  }));

  const handleExport = useCallback(() => {
    let filename: string;

    if (searchTerm.trim()) {
      filename = generateFilteredFilename(searchColumn, searchTerm);
    } else {
      filename = generateFullDataFilename();
    }

    exportToCsv(filteredData, columns, filename);
  }, [filteredData, searchColumn, searchTerm]);

  return (
    <FormProvider {...methods}>
      <section className="bg-white flex flex-col gap-2 w-full h-full p-2">
        <div className="flex justify-between items-end">
          <SearchForm
            searchColumns={searchColumnOptions}
            onExport={handleExport}
            showExport={true}
            exportButtonText={
              searchTerm.trim() ? "EXPORT FILTERED" : "EXPORT ALL"
            }
          />

          <DataStatusDisplay
            filteredCount={filteredCount}
            totalCount={totalCount}
            filterColumn={searchColumn}
            searchTerm={searchTerm}
          />
        </div>

        <CsvDataTable data={filteredData} columns={columns} />
      </section>
    </FormProvider>
  );
};

export default CSVTab;
