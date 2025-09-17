# CSV Tab Modular Architecture

This document describes the modular architecture implemented for the CSV Tab component.

## Component Structure

### 1. Main Component

- **Location**: `src/pages/csv-tab/index.tsx`
- **Purpose**: Orchestrates all child components and manages state
- **Dependencies**: Uses all modular components listed below

### 2. Modular Components

#### SearchForm Component

- **Location**: `src/components/csv-search-form/index.tsx`
- **Purpose**: Handles search term and column selection with React Hook Form and Zod validation
- **Features**:
  - Form validation using Zod schema
  - Real-time search updates
  - Clear functionality
  - Optional export button
- **Props**:
  - `searchColumns`: Array of search column options
  - `defaultSearchColumn`: Default selected column
  - `onSearchChange`: Callback for search changes
  - `onClear`: Callback for clear action
  - `onExport`: Optional export callback
  - `showExport`: Boolean to show/hide export button

#### CsvDataTable Component

- **Location**: `src/components/csv-data-table/index.tsx`
- **Purpose**: Generic table component for displaying CSV-like data
- **Features**:
  - Generic TypeScript implementation
  - Configurable columns
  - Responsive design
  - Hover effects
- **Props**:
  - `data`: Array of data objects
  - `columns`: Table column configuration
  - `className`: Optional additional CSS classes

#### DataStatusDisplay Component

- **Location**: `src/components/data-status-display/index.tsx`
- **Purpose**: Displays data count and filter status
- **Features**:
  - Shows filtered vs total row count
  - Displays active filter information
  - Color-coded status badges
- **Props**:
  - `filteredCount`: Number of filtered rows
  - `totalCount`: Total number of rows
  - `filterColumn`: Currently filtered column (optional)
  - `searchTerm`: Current search term (optional)

### 3. Custom Hooks

#### useDataFilter Hook

- **Location**: `src/hooks/useDataFilter.ts`
- **Purpose**: Encapsulates data filtering logic
- **Features**:
  - Memoized filtering for performance
  - Generic TypeScript implementation
  - Returns filtered data and counts
- **Parameters**:
  - `data`: Array of data to filter
  - `searchTerm`: Text to search for
  - `searchColumn`: Column to search in
- **Returns**:
  - `filteredData`: Filtered array
  - `filteredCount`: Number of filtered items
  - `totalCount`: Total number of items

### 4. Utilities

#### CSV Export Utilities

- **Location**: `src/utils/csv-export.ts`
- **Purpose**: Handles CSV file generation and download
- **Functions**:
  - `exportToCsv()`: Generates and downloads CSV file
  - `generateFilteredFilename()`: Creates descriptive filenames

### 5. Data Layer

#### CSV Data Constants

- **Location**: `src/data/csv-data.ts`
- **Purpose**: Centralized data definitions and mock data
- **Exports**:
  - `IDataRowType`: TypeScript interface for data rows
  - `columns`: Table column definitions
  - `mockData`: Sample data for development

## Benefits of This Architecture

1. **Reusability**: Components can be used in other parts of the application
2. **Maintainability**: Each component has a single responsibility
3. **Testability**: Components can be tested in isolation
4. **Type Safety**: Full TypeScript support with proper typing
5. **Performance**: Optimized with React hooks and memoization
6. **Separation of Concerns**: Logic is separated from presentation

## Usage Example

```tsx
import CSVTab from "./pages/csv-tab";

// The main component orchestrates everything
function App() {
  return <CSVTab />;
}
```

## Adding New Features

To add new features:

1. **New table columns**: Update `IDataRowType` and `columns` in `src/data/csv-data.ts`
2. **New search filters**: Extend the `SearchForm` component or create additional filter components
3. **New export formats**: Add functions to `src/utils/csv-export.ts`
4. **New data operations**: Create additional custom hooks in `src/hooks/`

## Component Dependencies

```
CSVTab (main)
├── SearchForm
│   ├── RhfTextField
│   ├── RhfDropdown
│   ├── Button
│   └── LabelValue
├── DataStatusDisplay
├── CsvDataTable
├── useDataFilter (hook)
├── csvExport (utilities)
└── csvData (constants)
```
