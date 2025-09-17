import React from "react";
import { useFormContext } from "react-hook-form";
import RhfTextField from "../rhf-text-field";
import RhfDropdown from "../rhf-dropdown";
import Button from "../button";
import LabelValue from "../label-value";

export interface SearchFormData {
  searchTerm: string;
  searchColumn: string;
}

interface SearchFormProps {
  searchColumns: Array<{ value: string; label: string }>;
  defaultSearchColumn?: string;
  onSearchChange?: (searchData: SearchFormData) => void;
  onClear?: () => void;
  onExport?: () => void;
  showExport?: boolean;
  exportButtonText?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchColumns,
  onClear,
  onExport,
  showExport = false,
  exportButtonText = "EXPORT",
}) => {
  // Get form context from FormProvider
  const { reset } = useFormContext<SearchFormData>();

  const handleClear = () => {
    reset({
      searchTerm: "",
      searchColumn: "state",
    });
    onClear?.();
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
          options={searchColumns}
          className="min-w-[140px]"
        />
      </LabelValue>

      <div className="flex gap-1">
        <Button onClick={handleClear} variant="warning">
          CLEAR
        </Button>
        {showExport && onExport && (
          <Button onClick={onExport} variant="success">
            {exportButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchForm;
