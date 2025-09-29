import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import SearchForm from "./csv-search-form";
import CsvDataTable from "../../components/csv-data-table";
import DataStatusDisplay from "../../components/data-status-display";
import { SortingToggleButton } from "../../components/csv-data-table/sorting-toggle-button";
import { csvSearchSchema, type CsvSearchFormData } from "../../schemas/forms";
import { ICanSatTelemetryData } from "../../data/csv-data";

const CSVTab = () => {
  const methods = useForm<CsvSearchFormData>({
    resolver: zodResolver(csvSearchSchema),
    defaultValues: {
      searchTerm: "",
      startDate: "",
      endDate: "",
      missionTimeStart: "",
      missionTimeEnd: "",
    },
  });

  // Sorting state
  const [sortingEnabled, setSortingEnabled] = useState(false);
  const [sortColumn, setSortColumn] = useState<
    keyof ICanSatTelemetryData | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof ICanSatTelemetryData) => {
    if (!sortingEnabled) return;

    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSortingToggle = (enabled: boolean) => {
    setSortingEnabled(enabled);
    if (!enabled) {
      setSortColumn(null);
      setSortDirection("asc");
    }
  };

  return (
    <FormProvider {...methods}>
      <section className="bg-white flex flex-col gap-2 w-full h-full p-2 overflow-hidden">
        <div className="flex justify-between items-end">
          <SearchForm
            sortingToggle={
              <SortingToggleButton
                enabled={sortingEnabled}
                onToggle={handleSortingToggle}
              />
            }
          />
          <DataStatusDisplay />
        </div>

        <CsvDataTable
          sortingEnabled={sortingEnabled}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </section>
    </FormProvider>
  );
};

export default CSVTab;
