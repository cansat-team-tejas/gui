import { useFormContext } from "react-hook-form";
import RhfTextField from "../../../components/rhf-text-field";
import RhfDropdown from "../../../components/rhf-dropdown";
import Button from "../../../components/button";
import LabelValue from "../../../components/label-value";
import { useMemo } from "react";
import { columns } from "../../../data/csv-data";
import type { CsvSearchFormData } from "../../../schemas/forms";

const SearchForm = () => {
  const { reset } = useFormContext();

  const TABLE_COLUMNS_OPTIONS = useMemo(
    () =>
      columns.map((col) => ({
        value: String(col.accessor),
        label: col.header,
      })),
    [columns]
  );

  const handleClear = () => {
    reset();
  };

  const handleExport = () => {
    console.log("Export clicked");
  };

  return (
    <div className="flex gap-2 items-end">
      <LabelValue
        label="SEARCH TERM"
        containerClassName="grid grid-cols-1 gap-1"
        labelClassName="text-[10px] font-bold"
      >
        <RhfTextField
          name="searchTerm"
          placeholder="ENTER SEARCH VALUE"
          className="min-w-[300px]"
        />
      </LabelValue>

      <LabelValue
        label="SEARCH COLUMN"
        containerClassName="grid grid-cols-1 gap-1"
        labelClassName="text-[10px] font-bold"
      >
        <RhfDropdown
          name="searchColumn"
          options={TABLE_COLUMNS_OPTIONS}
          className="min-w-[140px]"
        />
      </LabelValue>

      <div className="flex gap-1">
        <Button onClick={handleClear} variant="warning">
          CLEAR
        </Button>
        <Button onClick={handleExport} variant="success">
          EXPORT
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;
