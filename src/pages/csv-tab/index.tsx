import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SearchForm from "./csv-search-form";
import CsvDataTable from "../../components/csv-data-table";
import DataStatusDisplay from "../../components/data-status-display";
import { z } from "zod";

export const csvSearchSchema = z.object({
  searchTerm: z.string().optional(),
  searchColumn: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  missionTimeStart: z.string().optional(),
  missionTimeEnd: z.string().optional(),
});

export type CsvSearchFormData = z.infer<typeof csvSearchSchema>;

const CSVTab = () => {
  const methods = useForm<CsvSearchFormData>({
    resolver: zodResolver(csvSearchSchema),
    defaultValues: {
      searchTerm: "",
      searchColumn: "",
      startDate: "",
      endDate: "",
      missionTimeStart: "",
      missionTimeEnd: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <section className="bg-white flex flex-col gap-2 w-full h-full p-2 overflow-hidden">
        <div className="flex justify-between items-end flex-shrink-0">
          <SearchForm />
          <DataStatusDisplay />
        </div>

        <CsvDataTable />
      </section>
    </FormProvider>
  );
};

export default CSVTab;
