/**
 * FlatBook - A declarative data structure for generating spreadsheets using a simple, flat format.
 * 
 * ## Overview
 * The FlatBook structure organizes data using tables, groups, columns, and formulas, with support for advanced features like row selection, enums, and lookups.
 * 
 * ### Core Concepts
 * - **FlatBook**: The root structure combining all tables, columns, groups, formulas, and enums.
 * - **FlatColumnType**: Specify the type of data a column contains, including numeric, text, enum, and lookup types.
 * - **FlatFormula**: Reusable formulas that reference dynamic column selections using placeholders.
 * - **FlatColumn**: Defines the structure and data source for each column in a table.
 * - **FlatRowSelection**: Select rows with relative, absolute, or range-based methods.
 * 
 * ### Row Selection
 * - `all`: Selects all rows.
 * - `$n`: Selects the nth row of a column
 * - `+0` or `-0`: Selects the current row relative to the current row the formula is in.
 * - `+n` or `-n`: Select n rows relative to the current row the formula is in.
 * - Ranges: Combine selections with `:`, e.g., `$1:$3` or `+1:-1`, or even mixed selections like `$1:+1`.
 * 
 * ### Column Types
 * - `text` - Default type for text data.
 * - `dollar` - Numeric type with currency formatting (ex: $123.45).
 * - `number`, `percent`: Numeric types with optional decimals (ex: number => 123, number:2 => 123.45, percent:1 => 12.3%).
 * - `enum`: References predefined values in the `FlatEnumItem` list. (ex: enum:Status)
 * - `lookup`: References a column (ex: lookup:Table.Group.Column).
 */

/** Represents a string matching the FlatName pattern. */
export type FlatName = string;
export const FlatNameRegex = /^[A-Z][A-Z0-9_]*$/;

/** Represents a valid hexadecimal 3- or 6-digit color code. */
export type FlatColor = `#${string}`;
export const FlatColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Predefined color palettes for styling. */
export const FlatPalettes = [
    'pink', 'cranberry', 'red', 'rust', 'orange', 'yellow', 'green', 'moss', 'sage',
    'teal', 'slate', 'cyan', 'blue', 'azure', 'skyblue', 'lavender', 'indigo',
    'purple', 'plum', 'mauve', 'coral', 'terracotta', 'bronze', 'sand', 'taupe',
    'gray', 'charcoal'
] as const;

/** Represents a color palette from predefined FlatPalettes. */
export type FlatPalette = typeof FlatPalettes[number];

/* Column Types */

/** Represents the text type for columns. */
export const FlatTextType = 'text';
export type FlatTextType = typeof FlatTextType;

/** Represents the dollar type for columns. */
export const FlatDollarType = 'dollar';
export type FlatDollarType = typeof FlatDollarType;

/** Represents temporal types for columns - with iso | text format. */
export type FlatTemporalType = `${'date' | 'datetime'}${`:${'iso' | 'text'}` | ''}`;
export const FlatTemporalTypeRegex = /^(date|datetime)(?::(iso|text))?$/;

/** Represents numeric types with optional specified decimal precision. */
export type FlatNumericType = `${'number' | 'percent'}:${number}`;
export const FlatNumericTypeRegex = /^(number|percent)(?::(\d+))?$/;

/** Represents enum types referencing a FlatName. */
export type FlatEnumType = `enum:${FlatName}`;
export const FlatEnumTypeRegex = /^enum:([A-Z][A-Z0-9_]*)$/;

/** Represents a lookup type referencing a table, group, and column. */
export type FlatLookupType = `lookup:${string}.${string}.${string}`;
export const FlatLookupTypeRegex = /^lookup:([A-Z][A-Z0-9_]*)\.([A-Z][A-Z0-9_]*)\.([A-Z][A-Z0-9_]*)$/;

/** Represents the type of a column, including text, numeric, and enum types. */
export type FlatColumnType = FlatTextType | FlatDollarType | FlatTemporalType | FlatNumericType | FlatEnumType | FlatLookupType;

/* Column Sources */

/** Represents the source type for formula-derived data. */
export type FlatFormulaSource = `formula:${FlatName}`;
export const FlatFormulaSourceRegex = /^formula:([A-Z][A-Z0-9_]*)$/;

/** Represents the source type for data fetched from an external source. */
export type FlatExternalSource = `external:${string}`;
export const FlatExternalSourceRegex = /^external:(.+)$/;

/** Represents a manual data source for a column. */
export const FlatManualSource = 'manual';

/** Represents the source type of a column. */
export type FlatColumnSource = typeof FlatManualSource | FlatFormulaSource | FlatExternalSource;

/** Represents a column in a table. */
export type FlatColumn = {
    name: FlatName; // Name of the column
    description: string; // Description of the column

    table: FlatName; // Name of the table the column belongs to
    group: FlatName; // Name of the group the column belongs to
    type: FlatColumnType; // Data type of the column
    source: FlatColumnSource; // Source type of the column
};

/* Row and Selection Types */

/** Represents a prefix indicating a relative row selection. */
export type FlatRelativePrefix = '+' | '-';

/** Represents a prefix indicating an absolute row selection. */
export type FlatAbsolutePrefix = '$';

/** Represents a unit selection using a prefix and a numeric value. */
export type FlatUnitSelection = `${FlatAbsolutePrefix | FlatRelativePrefix}${number}`;

/** Specifies rows in a table using relative, absolute, or range-based selection. */
export type FlatRowSelection = `${FlatUnitSelection}${`:${FlatUnitSelection}` | ''}` | 'all';
export const FlatRowSelectionRegex = /^([$+\-]\d+)(?::([$+\-]\d+))?$/;

/** Represents a reference to a specific column within a table and group. */
export type FlatSelection = {
    table: string; // Table containing the referenced column
    group: string; // Group containing the referenced column
    column: string; // Name of the referenced column
    rows: FlatRowSelection; // Rows included in the selection
};

/** Represents a dynamic placeholder tag with a specific selection. */
export type FlatPlaceholder = {
    tag: string; // Unique identifier for the placeholder
    selection: FlatSelection; // Selection associated with the placeholder
};

/* Enums and Formulas */

/** Represents an enumerated value with a name, value, description, and color. */
export type FlatEnumItem = {
    name: FlatName; // Name of the enum
    value: string; // Enum value
    description: string; // Description of the enum value
    color: FlatColor; // Associated color for the enum value
};

/** Represents a formula for use in a table. */
export type FlatFormula = {
    name: string; // Formula name
    description: string; // Brief description of the formula

    formula: string; // The formula logic as a string
    refs: FlatPlaceholder[]; // References to columns used in the formula
};

/* Table Structure */

/** Represents a table in the book. */
export type FlatTable = {
    name: FlatName; // Name of the table
    description: string; // Description of the table

    rows: number; // Number of rows in the table
    palette: FlatPalette; // Color palette used for the table
};

/** Represents a group of columns within a table. */
export type FlatGroup = {
    name: FlatName; // Name of the group
    description: string; // Description of the group

    table: FlatName; // Name of the table the group belongs to
};

/* FlatBook (Top-Level Structure) */

/** Represents the entire table book structure. */
export type FlatBook = {
    name: FlatName; // Name of the book
    description: string; // Description of the book

    formulas: FlatFormula[]; // List of formulas in the book
    enums: FlatEnumItem[]; // List of enums in the book

    tables: FlatTable[]; // List of tables in the book
    groups: FlatGroup[]; // List of groups in the book    
    columns: FlatColumn[]; // List of columns in the book
};
