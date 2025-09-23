// Table configuration constants
export const TABLE_CONFIG = {
  VISIBLE_ROWS_THRESHOLD: 1000,
  BATCH_SIZE: 50,
  COLUMN_MIN_WIDTH: 140,
  HEADER_HEIGHT: 30,
} as const;

// Table styling constants
export const TABLE_STYLES = {
  HEADER_BG: "#D9D9D9",
  BORDER_COLOR: "border-black",
  TEXT_SIZE: "text-[12px]",
  LOADING_TEXT_SIZE: "text-[10px]",
} as const;
