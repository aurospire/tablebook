/* Reference */
/** Regex pattern for validating Reference strings. Must start with @ followed by allowed characters */
export const TableReferenceRegex = /^@(.+)$/;

/** Type for referencing context-dependent items (color, style, theme, type) defined in TableBook */
export type TableReference = `@${string}`;


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
    /** The row filter; 'self' refers to current row, undefined means entire column */
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

/* Expressions */

/** Expression that represents a fixed value */
export type TableLiteralExpression = string | number;

/** Type identifier for selector expressions */
export const TableSelectorExpressionType = 'selector';
/** Expression that references data via a selector */
export type TableSelectorExpression<Selector = TableSelector> = {
    type: typeof TableSelectorExpressionType;
    selector: Selector;
};

/** Type identifier for function extagspressions */
export const TableFunctionExpressionType = 'function';
/** Expression that applies a named function to a list of arguments */
export type TableFunctionExpression<Selector = TableSelector> = {
    type: typeof TableFunctionExpressionType;
    name: string;
    items: TableExpression<Selector>[];
}; // Function validity is user-responsibility 


/** Valid comparison operators for conditional expressions */
export const TableCompareOperators = ['=', '<>', '>', '<', '>=', '<='] as const;
/** Type representing valid comparison operators */
export type TableCompareOperator = typeof TableCompareOperators[number];

/** Type identifier for comparison expressions */
export const TableCompareExpressionType = 'compare';
/** Expression that compares two values using a comparison operator */
export type TableCompareExpression<Selector = TableSelector> = {
    type: typeof TableCompareExpressionType;
    op: TableCompareOperator;
    left: TableExpression<Selector>;
    right: TableExpression<Selector>;
};

/** Type identifier for combine expressions */
export const TableCombineOperators = ['+', '-', '*', '/', '^', '&'] as const;
/** Type representing valid combine operators */
export type TableCombineOperator = typeof TableCombineOperators[number];

/** Type identifier for combine expressions */
export const TableCombineExpressionType = 'combine';
/** Expression that combines multiple values using an operator */
export type TableCombineExpression<Selector = TableSelector> = {
    type: typeof TableCombineExpressionType;
    op: TableCombineOperator;
    items: TableExpression<Selector>[];
};

/** Type identifier for negated expressions */
export const TableNegateExpressionType = 'negate';
/** Expression that inverts the result of another expression */
export type TableNegateExpression<Selector = TableSelector> = {
    type: typeof TableNegateExpressionType;
    item: TableExpression<Selector>;
};

/** Type identifier for template expressions */
export const TableTemplateExpressionType = 'template';
/** Expression that formats a string using placeholders replaced by variables */
export type TableTemplateExpression<Selector = TableSelector> = {
    type: typeof TableTemplateExpressionType;
    text: string;
    vars?: Record<string, TableExpression<Selector>>;
};

/** All possible expression types for data computation and validation */
export type TableExpression<Selector = TableSelector> =
    | TableLiteralExpression
    | TableSelectorExpression<Selector>
    | TableFunctionExpression<Selector>
    | TableCompareExpression<Selector>
    | TableCombineExpression<Selector>
    | TableNegateExpression<Selector>
    | TableTemplateExpression<Selector>
    ;


/* Data Rules */
/** Regex pattern for validating temporal strings in ISO format */
export const TableTemporalStringRegex = /^\d{4}-\d{2}-\d{2}$/;
/** Date string in YYYY-MM-DD format */
export type TableDateString = `${number}-${number}-${number}`;
/** String representing either a date or datetime */
export type TableTemporalString = TableDateString;


/** Rule comparing a value to a fixed target using a comparison operator */
export type TableComparisonRule<T> = { type: TableCompareOperator; value: T; };


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
    when: Rule;
    /** Style to apply when the rule is true */
    style?: TableStyle | TableReference;
    /** Foreground color to apply when the rule is true, if style is provided - overrides style.fore */
    color?: TableColor | TableReference;
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
    integer?: number | TableDigitPlaceholder;    // Formatting for digits before decimal
    decimal?: number | TableDigitPlaceholder;    // Formatting for digits after decimal
    commas?: boolean;                            // Whether to separate thousands with commas
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
export type TableDataTypeBase<Kind extends string> = {
    kind: Kind;
    /** Optional base style for the column, will merge with theme data style */
    style?: TableStyle | TableReference;
};

/** Identifies a text type in the type system */
export const TableTextTypeKind = 'text';
/** 
 * Text data type for string values
 * Supports validation rules, conditional styling, and computed expressions
 */
export type TableTextType = TableDataTypeBase<typeof TableTextTypeKind> & {
    /** Optional array of conditional styles based on text rules */
    styles?: TableConditionalStyle<TableTextRule>[];
    /** Optional validation rule for the text content */
    rule?: TableTextRule;
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
/** Enumerated data type with a fixed set of possible values */
export type TableEnumType = TableDataTypeBase<typeof TableEnumTypeKind> & {
    /** Array of valid values for this enum */
    items: TableEnumItem[];
};


/** Identifies a lookup type in the type system */
export const TableLookupTypeKind = 'lookup';
/** A data type that restricts values to those present in a specified column. */
export type TableLookupType = TableDataTypeBase<typeof TableLookupTypeKind> & {
    /** Column containing the valid values for this lookup */
    column: TableColumnSelector;
    /** Optional array of conditional styles based on text rules */
    styles?: TableConditionalStyle<TableTextRule>[];
};


/** Identifies a numeric type in the type system */
export const TableNumericTypeKind = 'numeric';
/** Numeric data type for numbers, currency, percent */
export type TableNumericType = TableDataTypeBase<typeof TableNumericTypeKind> & {
    /** Optional array of conditional styles based on numeric rules */
    styles?: TableConditionalStyle<TableNumericRule>[];
    /** Optional validation rule for the numeric value */
    rule?: TableNumericRule;
    /** Optional formatting for how the number should be displayed */
    format?: TableNumericFormat | TableReference;
};

/** Identifies a temporal type in the type system */
export const TableTemporalTypeKind = 'temporal';
/** Temporal data type for dates and times */
export type TableTemporalType = TableDataTypeBase<typeof TableTemporalTypeKind> & {
    /** Optional array of conditional styles based on temporal rules */
    styles?: TableConditionalStyle<TableTemporalRule>[];
    /** Optional validation rule for the temporal value */
    rule?: TableTemporalRule;
    /** Optional formatting for how the date/time should be displayed */
    format?: TableTemporalFormat | TableReference;
};

/** 
 * Union of all possible data types in the system
 * Can be a concrete type definition or a reference to a predefined type
 */
export type TableDataType = TableTextType | TableEnumType | TableLookupType | TableNumericType | TableTemporalType;


/* Table Structures */

/** A named map of definitions where values can be either type `T` or a `TableReference`. */
export type TableReferenceMap<T> = Record<string, T | TableReference>;

/** Container for reusable definitions, enabling references to common elements across the TableBook. */
export type TableDefinitions = {
    /** Custom color definitions. Includes prebuilt colors from StandardPalettes->main */
    colors?: TableReferenceMap<TableColor>;
    /** Reusable style definitions */
    styles?: TableReferenceMap<TableHeaderStyle>;
    /** Custom theme definitions. Includes prebuilt Themes build from StandardPalettes */
    themes?: TableReferenceMap<TableTheme>;
    /** Custom numeric format definitions */
    numerics?: TableReferenceMap<TableNumericFormat>;
    /** Custom temporal format definitions */
    temporals?: TableReferenceMap<TableTemporalFormat>;
    /** Reusable type definitions */
    types?: TableReferenceMap<TableDataType>;
};

/** Regex pattern validating table unit names: must start with uppercase, followed by alphanumeric */
export const TableUnitNameRegex = /^[A-Z][A-Za-z0-9_]*$/;

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
    /** Optional container for reusable definitions */
    definitions?: TableDefinitions;
};

/** 
 * Defines how values are assigned to rows in a column 
 * Supports global expressions, per-row values, or mixed assignments.
 */
export type TableValues =
    | TableExpression<TableSelector> // One expression for all rows
    | TableExpression<TableSelector>[] // Explicit values for specific rows
    | {
        /** Explicitly assigned values for specific row indices */
        items?: TableExpression<TableSelector>[];
        /** Default expression for all rows not covered by `items` */
        rest?: TableExpression<TableSelector>;
    };

/** 
 * Definition of a single column in a table 
 * Specifies the data type, optional metadata, and row-based values.
 */
export type TableColumn = TableUnit & {
    /** Data type defining the content and behavior of this column */
    type: TableDataType | TableReference;
    /** Optional metadata describing where the column's data comes from */
    source?: string;
    /** Optional row-based expressions defining computed or assigned values */
    values?: TableValues;
};

/** A list of columns in a table. */
export type TableColumnList = {
    columns: TableColumn[];
};

/** A group of related columns in a table. */
export type TableGroup = TableUnit & TableColumnList;

/** A page in the workbook containing table data. */
export type TablePage = TableUnit & {
    /** Table structure: groups of columns or a flat column set. */
    schema: TableColumnList | TableGroup[];    
    /** Number of data rows in the table. */
    rows: number;
};

/** 
* Root type representing an entire workbook
* Contains all pages and shared definitions
*/
export type TableBook = TableUnit & {
    /** Array of pages in this workbook */
    pages: TablePage[];
};