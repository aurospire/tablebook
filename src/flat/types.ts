/** Represents a reference to a column in a specific page and group. */
export type FlatColumnReferences = {
    page: string; // Name of the page containing the referenced column
    group: string; // Name of the group containing the referenced column
    column: string; // Name of the referenced column
};

/** Defines a formula in the table, with optional references to columns used in the formula. */
export type FlatFormula = {
    name: string; // Formula name
    description: string; // Brief description of the formula
    formula: string; // The formula logic as a string
    /**
     * An optional record of column references used in the formula.
     * 
     * Dynamic placeholders are used instead of traditional cell references (e.g., A1 or C1:C)
     * for better clarity and flexibility. These placeholders follow patterns like `{{TAG}}1`
     * or `$$TAG$$1:$$TAG$$`.
     * 
     * Keys in the `refs` object correspond to the placeholders, and their values specify the
     * actual column being referenced.
     * 
     * NOTE: Keys must be unique strings (e.g., `TAG` or `CUSTOM_TAG`) and should be distinct
     * enough to allow straightforward replacement during formula parsing or rendering.
     */
    refs?: Record<string, FlatColumnReferences>;
};

/** Represents a name that matches the pattern [A-Z][A-Z0-9_]*. */
export const FlatNameRegex = /^[A-Z][A-Z0-9_]*$/;
export type FlatName = string; // A string that must match the FlatNameRegex pattern

/** Represents a valid hexadecimal color code. */
export const FlatColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/; // Regex for 3- or 6-digit hexadecimal color codes
export type FlatColor = `#${string}`;

/** Defines an enum with a name, value, description, and associated color. */
export type FlatEnum = {
    name: FlatName; // Enum name (must match FlatName pattern)
    value: string; // Enum value (e.g., 'small', 'medium', etc.)
    description: string; // Description of the enum value
    color: FlatColor; // / Vivid, dark enough for contrast on light background, representative, and distinct within the enum
};

/** Represents the number of decimal places for numeric columns. */
export type FlatDecimals = number; // Specifies the precision (number of decimal places)

/** Represents the available base types for columns (e.g., text, number, etc.). */
export const FlatTypes = ['text', 'number', 'percent', 'currency', 'date', 'datetime'] as const;

export type FlatNumericType = `${'number' | 'percent'}:${FlatDecimals}`; // Numeric type with specified decimal precision
export const FlatNumericTypeRegex = /^(number|percent):(\d+)$/; // Regex to validate FlatNumericType

export type FlatEnumType = `enum:${FlatName}`; // Enum type referencing a FlatName
export const FlatEnumTypeRegex = /^enum:([A-Z][A-Z0-9_]*)$/; // Regex to validate FlatEnumType

/** Represents the type of a column, including text, numeric, percentage, and enum types. */
export type FlatColumnType = typeof FlatTypes[number] | FlatNumericType | FlatEnumType; // Union of base, numeric, and enum types

/** Represents the source type for manual, formula-based, or external data. */
export const FlatManualSource = 'manual'; // Source type for manually entered data

export type FlatFormulaSource = `formula:${FlatName}`; // Source type for data derived from a formula
export const FlatFormulaSourceRegex = /^formula:([A-Z][A-Z0-9_]*)$/; // Regex to validate FlatFormulaSource

export type FlatExternalSource = `external:${string}`; // Source type for data fetched from an external source
export const FlatExternalSourceRegex = /^external:(.+)$/; // Regex to validate FlatExternalSource

export type FlatColumnSource = typeof FlatManualSource | FlatFormulaSource | FlatExternalSource; // Union of source types

/** Defines a column in the table, including its source (manual, formula, or external) and type. */
export type FlatColumn = {
    page: FlatName; // Name of the page the group belongs to
    group: FlatName; // Name of the group the column belongs to
    name: FlatName; // Column name (must match FlatName pattern)
    description: string; // Brief description of the column
    source: FlatColumnSource; // Source type of the column
    type: FlatColumnType; // Data type of the column
};

/** Represents a group of columns within a page. */
export type FlatGroup = {
    page: FlatName; // Name of the page the group belongs to
    name: FlatName; // Group name
    description: string; // Brief description of the group
};

/** Defines a set of predefined colors for styling. */
export const FlatPalettes = ['pink', 'cranberry', 'red', 'rust', 'orange', 'yellow', 'green', 'moss', 'sage',
    'teal', 'slate', 'cyan', 'blue', 'azure', 'skyblue', 'lavender', 'indigo', 'purple', 'plum',
    'mauve', 'coral', 'terracotta', 'bronze', 'sand', 'taupe', 'gray', 'charcoal'] as const;

export type FlatPalette = typeof FlatPalettes[number]; // Represents a valid palette color from FlatPalettes

/** Represents a page in the book, containing groups and a color palette. */
export type FlatPage = {
    name: FlatName; // Page name
    description: string; // Brief description of the page
    rows: number; // Number of rows on the page
    palette: FlatPalette; // Color palette used for the page
};

/** Represents the entire table book, including pages, groups, columns, formulas, and enums. */
export type FlatBook = {
    name: FlatName; // Book name
    description: string; // Brief description of the book
    pages: FlatPage[]; // List of pages in the book
    groups: FlatGroup[]; // List of groups in the book
    columns: FlatColumn[]; // List of columns in the book
    formulas: FlatFormula[]; // List of formulas in the book
    enums: FlatEnum[]; // List of enums in the book
};
