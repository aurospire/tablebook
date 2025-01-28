/* Overview */
// Types for TableBook - a declarative schema (like DDL for databases) for one-time spreadsheet generation.
// Each "page" has one table with at least one column group.
// TableBook implements a powerful table paradigm - a strict subset of spreadsheets with only vertical relationships.
// Data relationships and computations are column-based - no cell addresses or horizontal references.
// Ideally every Table theme should use its own palette.
// LLMs or UIs can create in JSON or YAML to be parsed into TableBook for processing.
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
 *   to the definitions object in the root TableBook object (e.g., styles, themes, formats).
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
 *   - Examples: { type: "raw", text: "SUM(@Revenue) + 10", tags: { "@Revenue": { column: { group: "Revenue", name: "Price" }, row: "all" } } }
 * 
 * Types are documented with JSON Schema patterns:
 * {
 *   "TableReference": {
 *     "pattern": "^@.+$",
 *     "description": "References start with @ followed by any characters"
 *   },
 *   "TableUnitName": {
 *     "pattern": "^[A-Z][A-Za-z0-9_]*$", 
 *     "description": "Must start with uppercase, followed by alphanumeric or underscore"
 *   },
 *   "TableTemporalString": {
 *     "pattern": "^\\d{4}-\\d{2}-\\d{2}",
 *     "description": "ISO format for dates and times"
 *   },
 *   "TableColor": {
 *     "pattern": "^#[A-Fa-f0-9]{6}$",
 *     "description": "6-digit hex color code"
 *   },
 *   "TableUnitSelector": {
 *     "pattern": "^[$+\\-]\\d+$",
 *     "description": "Absolute ($) or relative (+/-) row index"
 *   }
 * }
 */

/* Reference */
/** Regex pattern for validating Reference strings. Must start with @ followed by allowed characters */
export const TableReferenceRegex = /^@(.+)$/;

/** Type for referencing context-dependent items (color, style, theme, type) defined in TableBook */
export type TableReference<T extends string = string> = `@${T}`;


/* Data Selection */
// Selectors are used to target data within a single column of a table
// They define relationships between columns and rows relative to an element in the table paradigm
// Selection is column-based; multi-column or horizontal selection is not supported

/** Used to reference the current element in the scope where it is used */
export const TableSelfLiteral = 'self';
/** Type for self-referential selection */
export type TableSelfSelector = typeof TableSelfLiteral;

/** Used to reference all elements in the scope where it is used */
export const TableAllLiteral = 'all';
/** Type for all-referential selection */
export type TableAllSelector = typeof TableAllLiteral;

/** Identifies a specific column by name, optionally specifying its table and group */
export type TableColumnSelector = {
    /** The table containing the column; defaults to the element's page */
    page?: string;
    /** The group containing the column; defaults to the element's group */
    group?: string;
    /** The name of the column (required) */
    name: string;
};

/** Regex for validating unit selector syntax ($/+/-)number */
export const TableUnitSelectorRegex = /^([$+\-])(\d+)$/;
/** Valid prefixes for unit selection: $ for absolute index, +/- for relative offset */
export type TableUnitPrefix = '$' | '+' | '-';
/** Targets a single row in a column using absolute ($) or relative (+/-) indexing */
export type TableUnitSelector = `${TableUnitPrefix}${number}`;


/** Targets a range of rows within a column between two inclusive endpoints */
export type TableRangeSelector = {
    /** One boundary of the range (compiler determines order) */
    from: TableUnitSelector;

    /** The other boundary of the range (compiler determines order) */
    to: TableUnitSelector;
};

/** Targets rows in a column using a single position or a range */
export type TableRowSelector = TableUnitSelector | TableRangeSelector | TableAllSelector;

/** 
 * Combines column and row selection to target data within a table
 * Can be either a full selector object or 'self' for current element reference
 * When using object form: column defaults to current column if 'self', row defaults to current row if 'self'
 * When row is 'all' - refers to all rows in the column
 * When using 'self': refers to current element's exact position (both column and row) 
 */
export type TableSelector = {
    /** The column to target; 'self' refers to current element's column */
    column: TableColumnSelector | TableSelfSelector;
    /** Optional row filter; 'self' refers to current row, undefined means entire column */
    rows: TableRowSelector | TableSelfSelector;
} | TableSelfSelector; // Full self reference - both column and row of current element


/* Styling */
/** Hex color code in 6-digit format */
export const TableColorRegex = /^#[A-Za-z0-9]{6}$/;
/** Type for hex color values */
export type TableColor = `#${string}`;

/** Text formatting options */
export type TableTextForm = boolean | {};

/** Style definition for text and background */
export type TableStyle = {
    /** Text color, defaults to black */
    fore?: TableColor | TableReference;
    /** Background color, defaults to white */
    back?: TableColor | TableReference;
    /** Bolded, defaults to false */
    bold?: boolean;
    /** Italicized, defaults to false */
    italic?: boolean;
};

/** Available border line styles */
export const TableBorderTypes = ['none', 'thin', 'medium', 'thick', 'dotted', 'dashed', 'double'] as const;

/** Border line style type */
export type TableBorderType = typeof TableBorderTypes[number];

/** Border definition */
export type TableBorder = {
    /** Border line style */
    type: TableBorderType;
    /** Border color */
    color: TableColor | TableReference;
};

/** Group and column partition styling */
export type TablePartition = {
    /** Border beneath the Group-Header or Column-Header */
    beneath?: TableBorder;
    /** Border between the Groups-Columns or individual Columns */
    between?: TableBorder;
};

/** Extended style for headers including partition borders */
export type TableHeaderStyle = TableStyle & TablePartition;

/** Theme definition for consistent styling */
export type TableTheme = {
    /** Deep overriding inheritance from standard palettes/themes - order matters */
    inherits?: (TableReference)[];
    /** Tab color */
    tab?: TableColor | TableReference;
    /** Group header styling */
    group?: TableHeaderStyle | TableReference;
    /** Column header styling */
    header?: TableHeaderStyle | TableReference;
    /** Data cell styling */
    data?: TableStyle | TableReference;
};


/* Operators */
/** Valid comparison operators for conditional expressions */
export const TableComparisonOperators = ['=', '<>', '>', '<', '>=', '<='] as const;
/** Type representing valid comparison operators */
export type TableComparisonOperator = typeof TableComparisonOperators[number];

/** Valid merge operators for combining values */
export const TableMergeOperators = ['+', '-', '*', '/', '^', '&'] as const;
/** Type representing valid merge operators */
export type TableMergeOperator = typeof TableMergeOperators[number];

/* Expressions */
/** Type identifier for compound expressions that combine multiple values */
export const TableCompoundExpressionType = 'compound';
/** Expression that combines multiple values using comparison or merge operators */
export type TableCompoundExpression<Selector> = {
    type: typeof TableCompoundExpressionType;
    with: TableComparisonOperator | TableMergeOperator;
    items: TableExpression<Selector>[];
};

/** Type identifier for negated expressions */
export const TableNegatedExpressionType = 'negated';
/** Expression that inverts the result of another expression */
export type TableNegatedExpression<Selector> = {
    type: typeof TableNegatedExpressionType;
    on: TableExpression<Selector>;
};

/** Type identifier for function expressions */
export const TableFunctionExpressionType = 'function';
/** Expression that applies a named function to a list of arguments */
export type TableFunctionExpression<Selector> = {
    type: typeof TableFunctionExpressionType;
    name: string;
    args: TableExpression<Selector>[];
}; // Function validity is user-responsibility 

/** Type identifier for selector expressions */
export const TableSelectorExpressionType = 'selector';
/** Expression that references data via a selector */
export type TableSelectorExpression<Selector> = {
    type: typeof TableSelectorExpressionType;
    from: Selector;
};

/** Type identifier for literal expressions */
export const TableLiteralExpressionType = 'literal';
/** Direct value expression */
export type TableLiteralExpression = { type: typeof TableLiteralExpressionType, of: string | number | boolean; };

/** Type identifier for flat expressions */
export const TableRawExpressionType = 'raw';
/* Flattened Expression, tags are replaced in the expression text */
export type TableRawExpression<Selector> = { type: typeof TableRawExpressionType, text: string, tags?: Record<string, Selector>; };

/** All possible expression types for data computation and validation */
export type TableExpression<Selector> =
    | TableCompoundExpression<Selector>
    | TableNegatedExpression<Selector>
    | TableFunctionExpression<Selector>
    | TableSelectorExpression<Selector>
    | TableRawExpression<Selector>
    | TableLiteralExpression
    ;

/* Data Rules */
/** Regex pattern for validating temporal strings in ISO format */
export const TableTemporalStringRegex = /^\d{4}-\d{2}-\d{2}$/;
/** Date string in YYYY-MM-DD format */
export type TableDateString = `${number}-${number}-${number}`;
/** String representing either a date or datetime */
export type TableTemporalString = TableDateString;


/** Rule comparing a value to a fixed target using a comparison operator */
export type TableComparisonRule<T> = { type: TableComparisonOperator; value: T; };


/** Type for custom rules using DataSelector expressions */
export const TableCustomRuleType = 'custom';
/** Rule using a custom expression for complex validations */
export type TableCustomRule = { type: typeof TableCustomRuleType; expression: TableExpression<TableSelector>; };


/** Available range operators for numeric and temporal comparisons */
export const TableRangeOperators = ['between', 'outside'] as const;
/** Range operator type */
export type TableRangeOperator = typeof TableRangeOperators[number];
/** Rule validating if a value falls within or outside a range */
export type TableRangeRule<T> = { type: TableRangeOperator; low: T; high: T; };


/** Rule for validating numeric values */
export type TableNumericRule = TableComparisonRule<number> | TableRangeRule<number> | TableCustomRule;

/** Rule for validating temporal values */
export type TableTemporalRule = TableComparisonRule<TableTemporalString> | TableRangeRule<TableTemporalString> | TableCustomRule;


/** Available text matching operators */
export const TableMatchOperators = ['is', 'contains', 'begins', 'ends'] as const;
/** Text matching operator type */
export type TableMatchOperator = typeof TableMatchOperators[number];
/** Rule for string pattern matching */
export type TableMatchRule = { type: TableMatchOperator; value: string; };

/** Rule for validating text values */
export type TableTextRule = TableMatchRule | TableCustomRule;


/** Defines a style to apply when a rule condition is met */
export type TableConditionalStyle<Rule> = {
    rule: Rule;
    apply: TableStyle | TableReference;
};

/* Numeric Formats */

/** Controls how numbers display digits via format placeholders:
* fixed: Uses '0' - Always shows digit, displays 0 if no value
* flex: Uses '#' - Shows digit if present, shows nothing if no value
* align: Uses '?' - Shows digit if present, shows blank space if no value 
*/
export type TableDigitPlaceholder = {
    fixed?: number;  // Number of '0' digits
    flex?: number;   // Number of '#' digits
    align?: number;  // Number of '?' digits
};

/** Base configuration for all numeric format types */
export type TableBaseNumericFormat<Type extends string> = {
    type: Type;
    integer?: number | TableDigitPlaceholder;   // Formatting for digits before decimal
    decimal?: number | TableDigitPlaceholder;    // Formatting for digits after decimal
    commas?: boolean;  // Whether to separate thousands with commas
};

/** Format type for regular numbers */
export const TableNumberFormatType = 'number';
/** Configures how regular numbers display */
export type TableNumberFormat = TableBaseNumericFormat<typeof TableNumberFormatType>;

/** Format type for percentages */
export const TablePercentFormatType = 'percent';
/** Configures how percentages display, adds % symbol */
export type TablePercentFormat = TableBaseNumericFormat<typeof TablePercentFormatType>;

/** Format type for currency values */
export const TableCurrencyFormatType = 'currency';
/** Available positions for currency symbols */
export const TableCurrencySymbolPositions = ['prefix', 'suffix'] as const;
/** Configures how currency values display */
export type TableCurrencyFormat = TableBaseNumericFormat<typeof TableCurrencyFormatType> & {
    symbol?: string;  // Currency symbol, defaults to '$'
    position?: typeof TableCurrencySymbolPositions[number];  // Where to place the symbol
};

/** All available numeric format types */
export type TableNumericFormat =
    | TableNumberFormat
    | TablePercentFormat
    | TableCurrencyFormat
    ;


/* Temporal Formats */

/** Available lengths for temporal unit display */
export const TableTemporalUnitLengths = ['short', 'long'] as const;
/** Controls if unit shows abbreviated or full form */
export type TableTemporalUnitLength = typeof TableTemporalUnitLengths[number];

/** Available types of temporal units for formatting */
export const TableTemporalUnitTypes = ['year', 'month', 'monthname', 'weekday', 'day', 'hour', 'meridiem', 'minute', 'second'] as const;
/** Individual temporal unit that can be formatted */
export type TableTemporalUnitType = typeof TableTemporalUnitTypes[number];

/** Configures how a specific temporal unit should display */
export type TableTemporalUnit = { type: TableTemporalUnitType, length: TableTemporalUnitLength; };

/** Element in temporal format pattern - either a unit or literal string */
export type TableTemporalItem = TableTemporalUnit | string;

/** Complete format pattern for temporal values */
export type TableTemporalFormat = TableTemporalItem[];



/* Data Types */

/** Identifies a text type in the type system */
export const TableTextTypeKind = 'text';
/** 
 * Text data type for string values
 * Supports validation rules, conditional styling, and computed expressions
 */
export type TableTextType = {
    kind: typeof TableTextTypeKind;
    /** Optional validation rule for the text content */
    rule?: TableTextRule;
    /** Optional array of conditional styles based on text rules */
    styles?: TableConditionalStyle<TableTextRule>[];
};

/** 
 * Represents a single value in an enum type
 * Can be either a simple string or an object with an associated style
 * If both color and style are provided, color will override the style's fore color
 */
export type TableEnumItem = {
    name: string;
    description?: string;
    style?: TableStyle | TableReference;
    color?: TableColor | TableReference;
};

/** Identifies an enum type in the type system */
export const TableEnumTypeKind = 'enum';
/** 
 * Enumerated data type with a fixed set of possible values
 * Each value can have its own style
 */
export type TableEnumType = {
    kind: typeof TableEnumTypeKind;
    /** Array of valid values for this enum */
    items: TableEnumItem[];
};


/** Identifies a lookup type in the type system */
export const TableLookupTypeKind = 'lookup';
/** 
 * Lookup data type that references valid values from another column
 * Useful for maintaining consistency and relationships between columns
 */
export type TableLookupType = {
    kind: typeof TableLookupTypeKind;
    /** Column containing the valid values for this lookup */
    column: TableColumnSelector;
};


/** Identifies a numeric type in the type system */
export const TableNumericTypeKind = 'numeric';
/** 
 * Numeric data type for numbers and calculations
 * Supports formatting options, validation rules, and computed expressions
 */
export type TableNumericType = {
    kind: typeof TableNumericTypeKind;
    /** Optional validation rule for the numeric value */
    rule?: TableNumericRule;
    /** Optional array of conditional styles based on numeric rules */
    styles?: TableConditionalStyle<TableNumericRule>[];
    /** Optional formatting for how the number should be displayed */
    format?: TableNumericFormat | TableReference;
};

/** Identifies a temporal type in the type system */
export const TableTemporalTypeKind = 'temporal';
/** 
 * Temporal data type for dates and times
 * Supports multiple format options, validation rules, and computed expressions
 */
export type TableTemporalType = {
    kind: typeof TableTemporalTypeKind;
    /** Optional validation rule for the temporal value */
    rule?: TableTemporalRule;
    /** Optional array of conditional styles based on temporal rules */
    styles?: TableConditionalStyle<TableTemporalRule>[];
    /** Optional formatting for how the date/time should be displayed */
    format?: TableTemporalFormat | TableReference;
};


/** 
 * Union of all possible data types in the system
 * Can be a concrete type definition or a reference to a predefined type
 */
export type TableColumnType = TableTextType | TableEnumType | TableLookupType | TableNumericType | TableTemporalType;



/* Table Structures */

/** Regex pattern validating table unit names: must start with uppercase, followed by alphanumeric */
export const TableUnitNameRegex = /^[A-Z][A-Za-z0-9_]+$/;

/** 
* Base type for all table structural elements (column, group, page)
* Provides common properties for naming, theming and description
*/
export type TableUnit = {
    /** Unique identifier following TableUnitNameRegex pattern */
    name: string;
    /** Optional theme override for this unit */
    theme?: TableTheme | TableReference;
    /** Optional description of the unit's purpose */
    description?: string;
};

/** 
* Definition of a single column in a table
* Specifies the data type and optional metadata
*/
export type TableColumn = TableUnit & {
    /** Data type defining the content and behavior of this column */
    type: TableColumnType | TableReference;
    /** Optional metadata describing where the column's data comes from */
    source?: string;
    /** Optional expression to compute the value */
    expression?: TableExpression<TableSelector>;
};

/** 
* Groups related columns together
* Groups are hidden in the output if there's only one on a page, so the name doesn't matter (can be '')
*/
export type TableGroup = TableUnit & {
    /** Array of columns belonging to this group */
    columns: TableColumn[];
};

/** 
* Definition of a single page in the workbook
* Contains one table with one or more column groups
*/
export type TablePage = TableUnit & {
    /** Array of column groups */
    groups: TableGroup[];
    /** Number of data rows in the table */
    rows: number;
};

/** 
* Container for reusable definitions
* Enables referencing common elements across the TableBook
*/
export type TableDefinitions = {
    /** Custom color definitions. Includes prebuilt colors from StandardPalettes->main */
    colors?: Record<string, TableColor | TableReference>;
    /** Reusable style definitions */
    styles?: Record<string, TableHeaderStyle | TableReference>;
    /** Custom theme definitions. Includes prebuilt Themes build from StandardPalettes */
    themes?: Record<string, TableTheme | TableReference>;
    /** Custom numeric format definitions */
    numerics?: Record<string, TableNumericFormat | TableReference>;
    /** Custom temporal format definitions */
    temporals?: Record<string, TableTemporalFormat | TableReference>;
    /** Reusable type definitions */
    types?: Record<string, TableColumnType | TableReference>;
};

/** 
* Root type representing an entire workbook
* Contains all pages and shared definitions
*/
export type TableBook = TableUnit & {
    /** Array of pages in this workbook */
    pages: TablePage[];
    /** Optional container for reusable definitions */
    definitions?: TableDefinitions;
};