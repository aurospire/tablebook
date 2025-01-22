/**
 * TableBook Type System
 * A declarative schema (like DDL for databases) for one-time spreadsheet generation.
 * 
 * Key Concepts:
 * - Implements a table paradigm that is a strict subset of spreadsheets with only vertical relationships
 * - Data relationships and computations are column-based - no cell addresses or horizontal references
 * - Each page has one table with at least one column group
 * - Group headers are hidden in output if there's only one in a table
 * 
 * Design Principles:
 * - Standard Palettes should be ALWAYS BE USED over custom colors and themes
 * - If wanting to utilize a custom theme, it should be defined in the definitions object.
 * - Every Table theme should ideally use its own theme, but can inherit from others.
 * - LLMs or UIs can create in JSON or YAML to be parsed into TableBook
 * 
 * References:
 * - References are identified by their context and must **always begin with `@`** to denote a link 
 *   to the definitions object in the root TableBook object (e.g., palettes, styles, themes, formats).
 * 
 * Contextual Examples:
 * - **Themes**:
 *   - `"theme": "@business"` refers to a theme in `definitions.themes`.
 *   - `"inherits": ["@basic"]` refers to the `basic` theme defined in `definitions.themes`. it can inherit from multiple themes, with each theme overriding the previous one's properties.
 * - **Colors**:
 *   - `"fore": "@green"` references the `green` color from `definitions.colors`.
 * - **Styles**:
 *   - `"style": "@header"` refers to a predefined style in `definitions.styles`.
 * - **Type**:
 *   - `"type": "@currency"` references a format in `definitions.types`. (we see that each type has its own namespace)
 * - **Formats**:
 *   - `"format": "@currency"` references a format in `definitions.formats.numeric`. (if the parent type is numeric)
 * 
 * 
 * Predefined Palettes:
 * Palettes provide consistent color schemes
 * When used in themes, the palette is expanded to its individual colors 
 * - Darkest -> header.back
 * - Dark -> group.back
 * - Main -> tab
 * - Lightest -> data.back
 * 
 * When referenced as a color (not in theme), only the 'Main' shade is used.
 * Palettes are simple predefined definitons in the .colors and .themes objects, and are treated exactly like other definitions.
 * 
 * Theme Inheritance:
 * - Themes cascade down through the structure (TableBook -> TablePage -> TableGroup -> TableColumn)
 * - Each level can override the theme from its parent by providing an explicit theme
 * - undefined/missing theme does not override parent theme
 * - Multiple themes can be combined using the inherits array using a deep order-matters override
 * 
 * Formatting Controls:
 * Number formats use placeholder characters to control digit display:
 * - '0': fixed - Always shows digit, displays 0 if no value
 * - '#': flex - Shows digit if present, shows nothing if no value
 * - '?': align - Shows digit if present, shows blank space if no value
 * 
 * Data Selection:
 * The selector system enables precise targeting of data within tables using column and row references:
 * Since TableBook is column-based, all data selection is done by selecting subsets of named columns.
 * Columns are selected by name, and rows are selected by position or range within the column, either absolute or relative.
 * 
 * Column Selection:
 * - Made up of three parts: page, group, and column
 * - If page or group is missing, it refers to the current page or group
 * - ex: { page: "Sales", group: "Revenue", name: "Price" } - fully qualified
 * - ex: { group: "Revenue", name: "Price" } - within the current page
 * - ex: { name: "Price" } - within the current page and group
 * 
 * Row Selection:
 * - Rows are 0-based, with negative values not allowed
 * - Absolute position: "$n" refers to nth row (1-based)
 * - Relative forward: "+n" refers to n rows after current
 * - Relative backward: "-n" refers to n rows before current
 * - Range between positions: { from: "$1", to: "$5" } includes rows 1-5
 * - Range between relative positions: { from: "+1", to: "+5" } includes rows 1-5 after current
 * - 'self' refers to current row in scope
 * - 'all' refers to all rows in scope
 * 
 * Data Selection:
 * - Full column: { column: { name: "Price" }, row: "all" }
 * - Single cell: { column: { name: "Price" }, row: "$5" }
 * - Cell range: { column: { name: "Price" }, row: { from: "$1", to: "$5" } }
 * - Relative cells: { column: { name: "Price" }, row: "+1" }
 * - Different column, Same row { column: { group: 'Identity", name: "Id" }, row: "self" }
 * - Same column, Different row { column: "self", row: "$5" }
 * - Current cell: "self" // Only useful for validation/conditional formatting custom expressions
 * 
 * Expressions:
 * - Require full DataSelectors - not simply ColumnSelectors.
 * - Can be compound, negated, function, selector, or raw.
 * - Raw expressions can be used for custom expressions with references to DataSelectors.
 *   - Examples: { type: "raw", text: "SUM(@Revenue) + 10", refs: { "@Revenue": { column: { group: "Revenue", name: "Price" }, row: "all" } } }
 * 
 * Types are documented with JSON Schema patterns:
 * {
 *   "Reference": {
 *     "pattern": "^@.+$",
 *     "description": "References start with @ followed by any characters"
 *   },
 *   "TableUnitName": {
 *     "pattern": "^[A-Z][A-Za-z0-9_]*$", 
 *     "description": "Must start with uppercase, followed by alphanumeric or underscore"
 *   },
 *   "TemporalString": {
 *     "pattern": "^\\d{4}-\\d{2}-\\d{2}(?:[T ]\\d{2}:\\d{2}:\\d{2})?$",
 *     "description": "ISO format for dates and times"
 *   },
 *   "Color": {
 *     "pattern": "^#[A-Fa-f0-9]{6}$",
 *     "description": "6-digit hex color code"
 *   },
 *   "UnitSelector": {
 *     "pattern": "^[$+\\-]\\d+$",
 *     "description": "Absolute ($) or relative (+/-) row index"
 *   }
 * }
 */

/* Common String Literals */
export type TableDataTypeNames = 'text' | 'numeric' | 'temporal' | 'enum' | 'lookup';

export type TableRangeType = 'between' | 'outside';

export type TableMatchType = 'is' | 'contains' | 'begins' | 'ends';

export type TableExpressionType = 'compound' | 'negated' | 'function' | 'selector' | 'self';

export type TableBorderStyle = 'none' | 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed' | 'double';

export type TableNumberFormatType = 'number' | 'percent' | 'currency';

export type CurrencyPosition = 'prefix' | 'suffix';

export type TemporalLength = 'short' | 'long';

export type TemporalUnit = 'year' | 'month' | 'monthname' | 'weekday' | 'day' | 'hour' | 'meridiem' | 'minute' | 'second';

export type CompareOp = '=' | '<>' | '>' | '<' | '>=' | '<=';

export type MergeOp = '+' | '-' | '*' | '/' | '^' | '&';

/* References */
export type PaletteReference = '@pink' | '@cranberry' | '@red' | '@rust' | '@orange' | '@yellow' |
    '@green' | '@moss' | '@sage' | '@teal' | '@slate' | '@cyan' | '@blue' | '@azure' | '@skyblue' |
    '@lavender' | '@indigo' | '@purple' | '@plum' | '@mauve' | '@coral' | '@terracotta' | '@bronze' |
    '@sand' | '@taupe' | '@gray' | '@charcoal';

export type Reference = `@${string}`;

/* Data Selection Types */
export type SelfSelector = 'self';

export type AllSelector = 'all';

export type ColumnSelector = { page?: string; group?: string; name: string; };

export type UnitSelector = `$${number}` | `+${number}` | `-${number}`;

export type RangeRowSelector = { from: UnitSelector; to: UnitSelector; };

export type RowSelector = UnitSelector | RangeRowSelector;

export type DataSelector = { column: ColumnSelector | SelfSelector; row: RowSelector | SelfSelector | AllSelector; } | SelfSelector;

/* Styling Types */
export type Color = `#${string}`;

export type Style = { fore?: Color | PaletteReference | Reference; back?: Color | PaletteReference | Reference; bold?: boolean; italic?: boolean; };

export type Border = { type: TableBorderStyle; color: Color | PaletteReference | Reference; };

export type Partition = { beneath?: Border; between?: Border; };

export type HeaderStyle = Style & Partition;

/** 
 * Theme definition for consistent styling
 * Themes cascade through the hierarchy (Book -> Sheet -> Group -> Column)
 * Only explicit theme definitions override parent themes
 * Multiple themes can be combined using inherits array
 */
export type Theme = {
    /** Deep inheritance from other themes/palettes - order matters for overrides */
    inherits?: (PaletteReference | Reference)[];
    /** Sheet tab color */
    tab?: Color | PaletteReference | Reference;
    /** Group header styling */
    group?: HeaderStyle | Reference;
    /** Column header styling */
    header?: HeaderStyle | Reference;
    /** Data cell styling */
    data?: Style | Reference;
};

/* Expression Types */
export type CompoundExpression<T> = { type: 'compound'; with: CompareOp | MergeOp; items: Expression<T>[]; };

export type NegatedExpression<T> = { type: 'negated'; on: Expression<T>; };

export type FunctionExpression<T> = { type: 'function'; name: string; args: Expression<T>[]; };

export type SelectorExpression<T> = { type: 'selector'; from: T; };

export type RawExpression<T> = { type: 'raw'; text: string; refs: { [tag: string]: T; }; };

export type LiteralExpression = { type: 'literal', of: string | number | boolean; };

export type Expression<T> = CompoundExpression<T> | NegatedExpression<T> | FunctionExpression<T> | SelectorExpression<T> | RawExpression<T> | LiteralExpression;

/* Data Rule Types */
// YYYY-MM-DD
export type TemporalString = `${number}-${number}-${number}`;

export type ComparisonRule<T> = { type: CompareOp; value: T; };

export type CustomRule = { type: 'custom'; expression: Expression<DataSelector>; };

export type RangeRule<T> = { type: TableRangeType; low: T; high: T; };

export type MatchRule = { type: TableMatchType; value: string; };

export type NumericRule = ComparisonRule<number> | RangeRule<number> | CustomRule;

export type TemporalRule = ComparisonRule<TemporalString> | RangeRule<TemporalString> | CustomRule;

export type TextRule = MatchRule | CustomRule;

export type ConditionalStyle<T> = { rule: T; apply: Style | Reference; };

/* Format Types */
export type DigitPlaceholder = { fixed?: number; flex?: number; align?: number; };

// numbers instead of Placeholders => { fixed: number }
export type BaseNumberFormat<T extends TableNumberFormatType> = { type: T; integer?: number | DigitPlaceholder; decimal?: number | DigitPlaceholder; commas?: boolean; };

export type NumberFormat = BaseNumberFormat<'number'>;

export type PercentFormat = BaseNumberFormat<'percent'>;

export type CurrencyFormat = BaseNumberFormat<'currency'> & { symbol?: string; position?: CurrencyPosition; };

export type NumericFormat = NumberFormat | PercentFormat | CurrencyFormat;

export type TemporalUnitConfig = { type: TemporalUnit; length: TemporalLength; };

export type TemporalItem = TemporalUnitConfig | string;

export type TemporalFormat = TemporalItem[];

/* Data Types */
export type TextType = { kind: 'text'; rule?: TextRule; styles?: ConditionalStyle<TextRule>[]; };

export type EnumItem = { name: string; description?: string; style?: Style | Reference; };

export type EnumType = { kind: 'enum'; items: EnumItem[]; };

export type LookupType = { kind: 'lookup'; values: ColumnSelector; };

export type NumericType = { kind: 'numeric'; rule?: NumericRule; styles?: ConditionalStyle<NumericRule>[]; format?: NumericFormat | Reference; };

export type TemporalType = { kind: 'temporal'; rule?: TemporalRule; styles?: ConditionalStyle<TemporalRule>[]; format?: TemporalFormat | Reference; };

export type DataType = TextType | EnumType | LookupType | NumericType | TemporalType;

/* Table Structure Types */
export type TableUnit = { name: string; theme?: Theme | PaletteReference | Reference; description?: string; };

export type TableColumn = TableUnit & { type: DataType | Reference; expression?: Expression<DataSelector>; };

export type TableGroup = TableUnit & { columns: TableColumn[]; };

export type TablePage = TableUnit & { groups: TableGroup[]; rows: number; };

export type Definitions = {
    colors?: Record<string, Color | Reference>;
    styles?: Record<string, Style | HeaderStyle | Reference>;
    themes?: Record<string, Theme | Reference>;
    formats?: { numeric?: Record<string, NumericFormat | Reference>; temporal?: Record<string, TemporalFormat | Reference>; };
    types?: Record<string, DataType | Reference>;
};

export type TableBook = TableUnit & { pages: TablePage[]; definitions?: Definitions; };