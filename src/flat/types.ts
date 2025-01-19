/*
    FlatBook - A declarative data structure for generating Spreadsheets using a simple, flat format via the table paradigm.
/*

/** Represents a prefix indicating a relative row selection. */
export type FlatRelativePrefix = '+' | '-';

/** Represents a prefix indicating an absolute row selection. */
export type FlatAbsolutePrefix = '$';

/** Represents a unit selection using a prefix and a numeric value. */
export type FlatUnitSelection = `${FlatAbsolutePrefix | FlatRelativePrefix}${number}`;

/** 
 * Represents a selection of rows, either as a single unit, a range, or 'all'.
 * 'all' selects all rows in the table.
 * $n selects the nth row in the table.
 * An element refers to a particular cell that a formula is being applied to.
 * +/-0 selects the current row of an element.
 * +n selects n rows below the current row of an element.
 * -n selects n rows above the current row of an element.
 * 
 * Range selection are inclusive and can be in any order.
 * Example using absolute row selection: $1:$3 selects rows 1, 2, and 3.
 * Example using relative row selection: +1:-1 selects the row below the current row until the row above the current row.
 * Example using relative and absolute row selection: +1:$3 selects the row below the current row to row 3.
*/
export type FlatRowSelection = `${FlatUnitSelection}${`:${FlatUnitSelection}` | ''}` | 'all';
export const FlatRowSelectionRegex = /^(?:([$+\-]\d+)(?::([$+\-]\d+))?|all)$/;

/** Represents a reference to a specific column within a table and group. */
export type FlatSelection = {
    table: string; // Name of the table containing the referenced column
    group: string; // Name of the group containing the referenced column
    column: string; // Name of the referenced column
    rows: FlatRowSelection; // Number of rows included in the selection
};

/** Represents a dynamic placeholder tag with a specific selection. */
export type FlatPlaceholder = {
    tag: string; // Unique identifier for the placeholder. It does not need to follow a strict pattern but must be easy to replace and should not conflict with valid formula text.
    selection: FlatSelection; // Selection associated with the placeholder.
};

/** Defines a formula for use in the table, optionally referencing specific columns. */
export type FlatFormula = {
    name: string; // Formula name
    description: string; // Brief description of the formula
    formula: string; // The formula logic as a string
    /**
     * Optional references to columns used in the formula.
     * Placeholders can be any simple, unique string that is easy to replace
     * and does not conflict with valid formula text.
     * 
     * Keys in the `refs` object map placeholder tags to the corresponding column selections.
     * This design ensures flexibility while avoiding potential parsing issues.
     */
    refs: FlatPlaceholder[];
};

/** Represents a string matching the FlatName pattern. */
export type FlatName = string;
export const FlatNameRegex = /^[A-Z][A-Z0-9_]*$/;


/** Represents a valid hexadecimal 3- or 6-digit hexadecimal color codes. */
export type FlatColor = `#${string}`;
export const FlatColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Defines an enumerated value with a name, value, description, and color. */
export type FlatEnumItem = {
    name: FlatName; // Name of the enum (must match FlatName pattern)
    value: string; // Enum value (e.g., 'small', 'medium', etc.)
    description: string; // Description of the enum value
    color: FlatColor; // Associated color for the enum value
};

/** Represents the available base types for columns. */
export const FlatTypes = ['text', 'currency', 'date', 'datetime'] as const;

/** Specifies the precision (number of decimal places) for numeric columns. */
export type FlatDecimals = number;

/** Represents numeric types with optional specified decimal precision. */
export type FlatNumericType = `${'number' | 'percent'}:${FlatDecimals}`;
export const FlatNumericTypeRegex = /^(number|percent)(?::(\d+))?$/;

/** Represents enum types referencing a FlatName. */
export type FlatEnumType = `enum:${FlatName}`;
export const FlatEnumTypeRegex = /^enum:([A-Z][A-Z0-9_]*)$/;

// Represents a lookup type referencing a table, group, and column.
export type FlatLookupType = `lookup:${string}.${string}.${string}`;
export const FlatLookupTypeRegex = /^lookup:([A-Z][A-Z0-9_]*)\.([A-Z][A-Z0-9_]*)\.([A-Z][A-Z0-9_]*)$/;

/** Represents the type of a column, including text, numeric, and enum types. */
export type FlatColumnType = typeof FlatTypes[number] | FlatNumericType | FlatEnumType | FlatLookupType;

/** Represents the source type for manual, formula-based, or external data. */
export const FlatManualSource = 'manual';

/** Represents the source type for formula-derived data. */
export type FlatFormulaSource = `formula:${FlatName}`;
export const FlatFormulaSourceRegex = /^formula:([A-Z][A-Z0-9_]*)$/;

/** Represents the source type for data fetched from an external source. */
export type FlatExternalSource = `external:${string}`;
export const FlatExternalSourceRegex = /^external:(.+)$/;


/** Represents the source type of a column. */
export type FlatColumnSource = typeof FlatManualSource | FlatFormulaSource | FlatExternalSource;

/** Defines a column in the table. */
export type FlatColumn = {
    table: FlatName; // Table the column belongs to
    group: FlatName; // Group the column belongs to
    name: FlatName; // Name of the column
    description: string; // Description of the column
    source: FlatColumnSource; // Source type of the column
    type: FlatColumnType; // Data type of the column
};

/** Represents a group of columns within a table. */
export type FlatGroup = {
    table: FlatName; // Table the group belongs to
    name: FlatName; // Name of the group
    description: string; // Description of the group
};

/** Predefined color palettes for styling. */
export const FlatPalettes = ['pink', 'cranberry', 'red', 'rust', 'orange', 'yellow', 'green', 'moss', 'sage',
    'teal', 'slate', 'cyan', 'blue', 'azure', 'skyblue', 'lavender', 'indigo', 'purple', 'plum',
    'mauve', 'coral', 'terracotta', 'bronze', 'sand', 'taupe', 'gray', 'charcoal'] as const;

/** Represents a color palette from predefined FlatPalettes. */
export type FlatPalette = typeof FlatPalettes[number];

/** Represents a table in the book. */
export type FlatTable = {
    name: FlatName; // Name of the table
    description: string; // Description of the table
    rows: number; // Number of rows in the table
    palette: FlatPalette; // Color palette used for the table
};

/** Represents the entire table book structure. */
export type FlatBook = {
    name: FlatName; // Name of the book
    description: string; // Description of the book
    tables: FlatTable[]; // List of tables in the book
    groups: FlatGroup[]; // List of groups in the book
    formulas: FlatFormula[]; // List of formulas in the book
    enums: FlatEnumItem[]; // List of enums in the book
    columns: FlatColumn[]; // List of columns in the book
};
