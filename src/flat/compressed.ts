/**
 * Book - A declarative data structure for generating spreadsheets using a simple, flat declarative format.
 * 
 * ## Overview
 * The Book structure organizes data using pages, groups, columns, and formulas, with support for advanced features like row selection, enums, and lookups.
 * 
 * ### Naming Conventions
 * - Names are unique identifiers for pages, groups, columns, formulas, and enums.
 * - They should ideally be CapitalizedCamelCase, starting with a capital letter and using camel case.
 * - Names: /^[A-Z][A-Z0-9_]*$/ 
 * - Names should be descriptive and concise, reflecting the purpose of the item.
 * - Underscores are allowed in names, but should be used sparingly and only for clarity.
 * 
 * ### Formula Placeholder
 * - Placeholders are used to reference columns in formulas in an TableColumn-centric way.
 * - Placeholders are defined using a unique identifier and a selection - such as `{{TAG}}` or `$$TAG$$`
 * - Example Placeholder Formula: `=SUM({{TAG}})`, where `{{TAG}}` is a placeholder like { page: 'Table', group: 'Group', column: 'Column', rows: 'all' }
 * - Tags are unique identifiers for placeholders, and selections specify the page, group, column, and rows to include in the formula.
 * 
 * ### Column Types
 * - `text` - Default type for text data.
 * - `dollar` - Numeric type with currency formatting (ex: $123.45).
 * - `number`, `percent`: Numeric types with optional decimals (ex: number => 123, number:2 => 123.45, percent:1 => 12.3%).
 * - `date`, `datetime`: Temporal types with optional ISO or text format (ex: date:iso => YYYY-MM-DD, datetime:text => Sun, Jan 1, 2025 12:00:00 AM).
 * - `enum`: References predefined values in the `EnumItem` list. (ex: enum:Status)
 * - `lookup`: References a column (ex: lookup:Table.Group.Column).
 * 
 * ### Row Selection
 * - `all`: Selects all rows.
 * - `$n`: Selects the nth row of a column
 * - `+0` or `-0`: Selects the current row relative to the current row the formula is in.
 * - `+n` or `-n`: Select n rows relative to the current row the formula is in.
 * - Ranges: Combine selections with `:`, e.g., `$1:$3` or `+1:-1`, or even mixed selections like `$1:+1`.
 * 
 * ### Enumerations
 * - Enumerations are predefined lists of values with associated colors.
 * - Example Enum: { name: 'Status', value: 'Active', description: 'Active Status', color: '#4C9900' }
 *                 { name: 'Status', value: 'Inactive', description: 'Inactive Status', color: '#993366' }
 * - The `name` field is used to link enum values to columns with the `enum:Status` type.
 * - Colors should be representative of the value, with each value's color unique to the enum,
 *   and a deep and vivid color that contrasts well with a light background.
 */

// Names are Capital Case /^[A-Z][A-Za-z0-9_]*$/
export type Name = string;

/** Represents a valid hexadecimal 6-digit color code. */
export type Color = `#${string}`;

export type Palette = 'pink' | 'cranberry' | 'red' | 'rust' | 'orange' | 'yellow' | 'green' | 'moss' | 'sage' |
    'teal' | 'slate' | 'cyan' | 'blue' | 'azure' | 'skyblue' | 'lavender' | 'indigo' |
    'purple' | 'plum' | 'mauve' | 'coral' | 'terracotta' | 'bronze' | 'sand' | 'taupe' |
    'gray' | 'charcoal';

export type ColumnType = 'text' | 'dollar' | `${'date' | 'datetime'}${`:${'iso' | 'text'}`}`
    | `${'number' | 'percent'}:${number}` | `enum:${Name}` | `lookup:${Name}.${Name}.${Name}`;


export type ColumnSource = 'manual' | `formula:${Name}` | `external:${string}`;

export type Column = { table: Name; group: Name; name: Name; description: string; type: ColumnType; source: ColumnSource; };

export type UnitSelection = `${'$' | '+' | '-'}${number}`;

export type RowSelection = `${UnitSelection}${`:${UnitSelection}` | ''}` | 'all';

export type Selection = { page: string; group: string; column: string; rows: RowSelection; };

export type Placeholder = { tag: string; selection: Selection; };

export type EnumItem = { name: Name; value: string; description: string; color: Color; };

export type Formula = { name: string; description: string; formula: string; refs: Placeholder[]; };

export type Table = { name: Name; description: string; rows: number; palette: Palette; };

export type Group = { name: Name; description: string; page: Name; };

export type Book = {
    name: Name; description: string;
    formulas: Formula[]; enums: EnumItem[];
    pages: Table[]; groups: Group[]; columns: Column[];
};
