/* Overview */
// Types for TableBook - a declarative schema (like DDL for databases) for one-time spreadsheet generation.
// Each sheet has one table with at least one column group.
// TableBook implements a powerful table paradigm - a strict subset of spreadsheets with only vertical relationships.
// Data relationships and computations are column-based - no cell addresses or horizontal references.
// Standard components when they exist (ie: palettes) should be preferred over definitions, and definitions over inline.
// Ideally every Table theme should use its own palette.
// LLMs or UIs can create in JSON or YAML to be parsed into TableBook for processing.

/* Reference */
/** Regex pattern for validating Reference strings. Must start with @ followed by allowed characters */
export const ReferenceRegex = /^@[A-Za-z_][A-Za-z0-9_]+$/;

/** Type for referencing context-dependent items (color, style, theme, type) defined in TableBook */
export type Reference<Set extends string = string> = `@${Set}`;



/* Data Selection */
// Selectors are used to target data within a single column of a table
// They define relationships between columns and rows relative to an element in the table paradigm
// Selection is column-based; multi-column or horizontal selection is not supported

/** Used to reference the current element in the scope where it is used */
export const SelfLiteral = 'self';
/** Type for self-referential selection */
export type SelfSelector = 'self';

/** Identifies a specific column by name, optionally specifying its table and group */
export type ColumnSelector = {
    /** The table containing the column; defaults to the element's table */
    table?: string;
    /** The group containing the column; defaults to the element's group */
    group?: string;
    /** The name of the column (required) */
    name: string;
};

/** Regex for validating unit selector syntax ($/+/-)number */
export const UnitSelectorRegex = /^([$+\-])(\d+)$/;
/** Valid prefixes for unit selection: $ for absolute index, +/- for relative offset */
export type UnitPrefix = '$' | '+' | '-';
/** Targets a single row in a column using absolute ($) or relative (+/-) indexing */
export type UnitSelector = `${UnitPrefix}${number}`;

/** Targets a range of rows within a column between two endpoints */
export type RangeRowSelector = {
    /** One boundary of the range (compiler determines order) */
    from: UnitSelector;
    /** The other boundary of the range (compiler determines order) */
    to: UnitSelector;
};

/** Targets rows in a column using a single position or a range */
export type RowSelector = UnitSelector | RangeRowSelector;

/** 
 * Combines column and row selection to target data within a table
 * Can be either a full selector object or 'self' for current element reference
 * When using object form: column defaults to current column if 'self', row defaults to entire column if undefined
 * When using 'self': refers to current element's exact position (both column and row) 
 */
export type DataSelector = {
    /** The column to target; 'self' refers to current element's column */
    column: ColumnSelector | SelfSelector;
    /** Optional row filter; 'self' refers to current row, undefined means entire column */
    row?: RowSelector | SelfSelector;
} | SelfSelector; // Full self reference - both column and row of current element


/* Styling */
/** Hex color code in 6-digit format */
export const ColorRegex = /^#[A-Za-z0-9]{6}$/;
/** Type for hex color values */
export type Color = `#${string}`;

/** Creates a four-shade color palette 
 * When used as theme: darkest->header.back, dark->group.back, main->tab, lightest->data.back
 * When used as color reference: uses main shade */
export const palette = (
    darkest: Color,
    dark: Color,
    main: Color,
    lightest: Color
) => ({ darkest, dark, main, lightest });

/** Predefined color palettes */
export const StandardPalettes = {
    // Reds
    pink: palette('#741F3F', '#C0315A', '#E84E76', '#FFD6E0'), // True rose pink
    cranberry: palette('#4C0D1C', '#721026', '#A31432', '#F4C2C9'), // Deep burgundy-cranberry
    red: palette('#660000', '#880000', '#C32222', '#F8C5C5'), // Classic red shades

    // Oranges and Yellows
    rust: palette('#8B3103', '#B54D18', '#D65C2B', '#F7D5BC'), // Deep orange-brown
    orange: palette('#783F04', '#B45F06', '#E6751A', '#FDD9BC'), // Bold orange shades
    yellow: palette('#856500', '#BF9000', '#E6AC1E', '#FFF2C4'), // Golden yellow tones

    // Greens
    green: palette('#294E13', '#38761D', '#4B9022', '#D6E8CE'), // Deep forest green
    moss: palette('#1E4D2B', '#3A7A47', '#519563', '#D4E8D1'), // Cool earthy green
    sage: palette('#38471F', '#596F34', '#788F4A', '#DCEADF'), // Muted green tones

    // Blues
    teal: palette('#004548', '#006E6E', '#008F8F', '#D1F0EC'), // Deep blue-green
    slate: palette('#2A4545', '#366060', '#507878', '#DEE8E8'), // Muted gray-blue
    cyan: palette('#0C343D', '#134F5C', '#1B657A', '#CBE5E8'), // Fresh blue-green
    blue: palette('#073763', '#0B5394', '#1763B8', '#CEE2F0'), // Classic blue shades
    azure: palette('#123A75', '#1E5BAA', '#2D70C8', '#D0E2F4'), // Bright sky blue
    skyblue: palette('#004080', '#0066CC', '#2E8FEA', '#D0E6F8'), // Light sky blue

    // Purples
    lavender: palette('#3F3677', '#5F51B7', '#776CCF', '#DAD5F2'), // Soft lavender tones
    indigo: palette('#20124D', '#351C75', '#483CA4', '#D5D0E3'), // Deep blue-purple
    purple: palette('#2D0A53', '#4B0082', '#6A0DAD', '#E6D5FF'), // Rich royal purple
    plum: palette('#4E1A45', '#6C3483', '#8E4FA8', '#E7D0EA'), // Warm purple-pink
    mauve: palette('#682F42', '#8D4659', '#A85475', '#F5D4DC'), // Dusky purple-pink

    // Neutrals    
    coral: palette('#762F2F', '#AF4A4A', '#D36868', '#FFE0DC'), // Warm reddish-pink
    terracotta: palette('#713F2D', '#9C5F4E', '#C87561', '#FAD9CE'), // Earthy orange-red
    bronze: palette('#5D4037', '#895D4D', '#A6705F', '#EAD6C7'), // Metallic brown
    sand: palette('#6A5D47', '#8C755D', '#B5937A', '#EDE0D2'), // Warm beige tones
    taupe: palette('#483C32', '#6B5D4F', '#857667', '#E5DBD1'), // Neutral brown-gray
    gray: palette('#3B3B3B', '#656565', '#7E7E7E', '#E8E8E8'), // Neutral gray shades
    charcoal: palette('#2A2A2A', '#4D4D4D', '#676767', '#E2E2E2'), // Deep gray tones
};

/** Reference to a standard color palette */
export type StandardPaletteReference = Reference<keyof typeof StandardPalettes>;

/** Text formatting options */
export type TextForm = boolean | { bold?: boolean; italic?: boolean; };

/** Style definition for text and background */
export type Style = {
    /** Text color, defaults to black */
    fore?: Color | StandardPaletteReference | Reference;
    /** Background color, defaults to white */
    back?: Color | StandardPaletteReference | Reference;
    /** Text formatting, defaults to false */
    form?: TextForm;
};

/** Available border line styles */
export const BorderTypes = ['none', 'thin', 'medium', 'thick', 'dotted', 'dashed', 'double'] as const;

/** Border line style type */
export type BorderType = typeof BorderTypes[number];

/** Border definition */
export type Border = {
    /** Border line style */
    type: BorderType;
    /** Border color, defaults to black */
    color?: Color | StandardPaletteReference | Reference;
};

/** Group and column partition styling */
export type Partition = {
    /** Border below the Group-Header or Column-Header */
    below?: Border;
    /** Border between the Groups-Columns or individual Columns */
    between?: Border;
};

/** Extended style for headers including partition borders */
export type HeaderStyle = Style & Partition;

/** Theme definition for consistent styling */
export type Theme = {
    /** Deep overriding inheritance from standard palettes/themes - order matters */
    inherits?: (StandardPaletteReference | Reference)[];
    /** Tab color */
    tab?: Color | StandardPaletteReference | Reference;
    /** Group header styling */
    group?: HeaderStyle | Reference;
    /** Column header styling */
    header?: HeaderStyle | Reference;
    /** Data cell styling */
    data?: Style | Reference;
};



/* Operators */
/** Valid comparison operators for conditional expressions */
export const ComparisonOperators = ['=', '<>', '>', '<', '>=', '<='] as const;
/** Type representing valid comparison operators */
export type ComparisonOperator = typeof ComparisonOperators[number];

/** Valid merge operators for combining values */
export const MergeOperators = ['+', '-', '*', '/', '^', '&'] as const;
/** Type representing valid merge operators */
export type MergeOperator = typeof MergeOperators[number];

/* Expressions */
/** Type identifier for compound expressions that combine multiple values */
export const CompoundExpressionType = 'compound';
/** Expression that combines multiple values using comparison or merge operators */
export type CompoundExpression<Selector> = {
    type: typeof CompoundExpressionType;
    with: ComparisonOperator | MergeOperator;
    items: Expression<Selector>[];
};

/** Type identifier for negated expressions */
export const NegatedExpressionType = 'negated';
/** Expression that inverts the result of another expression */
export type NegatedExpression<Selector> = {
    type: typeof NegatedExpressionType;
    on: Expression<Selector>;
};

/** Type identifier for function expressions */
export const FunctionExpressionType = 'function';
/** Expression that applies a named function to a list of arguments */
export type FunctionExpression<Selector> = {
    type: typeof FunctionExpressionType;
    name: string;
    args: Expression<Selector>[];
}; // Function validity is user-responsibility 

/** Type identifier for selector expressions */
export const SelectorExpressionType = 'selector';
/** Expression that references data via a selector */
export type SelectorExpression<Selector> = {
    type: typeof SelectorExpressionType;
    from: Selector;
};

/** Expression referencing the current element's value */
export type SelfExpression = { type: typeof SelfLiteral; };

/** Type identifier for literal expressions */
export const LiteralExpressionType = 'literal';
/** Direct value expression */
export type LiteralExpression = { type: typeof LiteralExpressionType, value: string | number | boolean; };

/** All possible expression types for data computation and validation */
export type Expression<Selector> =
    | CompoundExpression<Selector>
    | NegatedExpression<Selector>
    | FunctionExpression<Selector>
    | SelectorExpression<Selector>
    | LiteralExpression
    | SelfExpression;



/* Data Rules */

/** Regex pattern for validating temporal strings in ISO format */
export const TemporalStringRegex = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2})?$/;
/** Date string in YYYY-MM-DD format */
export type DateString = `${number}-${number}-${number}`;
/** DateTime string in YYYY-MM-DD HH:mm:ss format, allowing T or space separator */
export type DateTimeString = `${DateString}${'T' | ' '}${number}:${number}:${number}`;
/** String representing either a date or datetime */
export type TemporalString = DateString | DateTimeString;


/** Rule comparing a value to a fixed target using a comparison operator */
export type ComparisonRule<T> = { type: ComparisonOperator; to: T; };


/** Type for custom rules using DataSelector expressions */
export const CustomRuleType = 'custom';
/** Rule using a custom expression for complex validations */
export type CustomRule = { type: typeof CustomRuleType; expression: Expression<DataSelector>; };


/** Available range operators for numeric and temporal comparisons */
export const RangeOperators = ['between', 'outside'] as const;
/** Range operator type */
export type RangeOperator = typeof RangeOperators[number];
/** Rule validating if a value falls within or outside a range */
export type RangeRule<T> = { type: RangeOperator; low: T; high: T; };


/** Rule for validating numeric values */
export type NumericRule = ComparisonRule<number> | RangeRule<number> | CustomRule;

/** Rule for validating temporal values */
export type TemporalRule = ComparisonRule<TemporalString> | RangeRule<TemporalString> | CustomRule;


/** Available text matching operators */
export const MatchOperators = ['contains', 'begins', 'ends'] as const;
/** Text matching operator type */
export type MatchOperator = typeof MatchOperators[number];
/** Rule for string pattern matching */
export type MatchRule = { type: MatchOperator; value: string; };

/** Rule for validating text values */
export type TextRule = MatchRule | CustomRule;


/** Defines a style to apply when a rule condition is met */
export type ConditionalStyle<Rule> = {
    on: Rule;
    style: Style | Reference;
};



/* Numeric Formats */

/** Controls how numbers display digits via format placeholders:
* fixed: Uses '0' - Always shows digit, displays 0 if no value
* flex: Uses '#' - Shows digit if present, shows nothing if no value
* align: Uses '?' - Shows digit if present, shows blank space if no value 
*/
export type DigitPlaceholder = {
    fixed?: number;  // Number of '0' digits
    flex?: number;   // Number of '#' digits
    align?: number;  // Number of '?' digits
};

/** Base configuration for all numeric format types */
export type BaseNumberFormat<Type extends string> = {
    type: Type;
    integer?: number | DigitPlaceholder;   // Formatting for digits before decimal
    decimal?: number | DigitPlaceholder;    // Formatting for digits after decimal
    commas?: boolean;  // Whether to separate thousands with commas
};

/** Format type for regular numbers */
export const NumberFormatType = 'number';
/** Configures how regular numbers display */
export type NumberFormat = BaseNumberFormat<typeof NumberFormatType>;

/** Format type for percentages */
export const PercentFormatType = 'percent';
/** Configures how percentages display, adds % symbol */
export type PercentFormat = BaseNumberFormat<typeof PercentFormatType>;

/** Format type for currency values */
export const CurrencyFormatType = 'currency';
/** Available positions for currency symbols */
export const CurrencySymbolPositions = ['prefix', 'suffix'] as const;
/** Configures how currency values display */
export type CurrencyFormat = BaseNumberFormat<typeof CurrencyFormatType> & {
    symbol?: string;  // Currency symbol, defaults to '$'
    position?: typeof CurrencySymbolPositions[number];  // Where to place the symbol
};

/** All available numeric format types */
export type NumericFormat =
    | NumberFormat
    | PercentFormat
    | CurrencyFormat
    ;



/* Temporal Formats */

/** Available lengths for temporal unit display */
export const TemporalUnitLengths = ['short', 'long'] as const;
/** Controls if unit shows abbreviated or full form */
export type TemporalUnitLength = typeof TemporalUnitLengths[number];

/** Available types of temporal units for formatting */
export const TemporalUnitTypes = ['year', 'month', 'monthname', 'weekday', 'day', 'hour', 'meridiem', 'minute', 'second'] as const;
/** Individual temporal unit that can be formatted */
export type TemporalUnitType = typeof TemporalUnitTypes[number];

/** Configures how a specific temporal unit should display */
export type TemporalUnit = { type: TemporalUnitType, length: TemporalUnitLength; };

/** Element in temporal format pattern - either a unit or literal string */
export type TemporalItem = TemporalUnit | string;

/** Complete format pattern for temporal values */
export type TemporalFormat = TemporalItem[];



/* Data Types */

/** Identifies a text type in the type system */
export const TextTypeName = 'text';
/** 
 * Text data type for string values
 * Supports validation rules, conditional styling, and computed expressions
 */
export type TextType = {
    name: typeof TextTypeName;
    /** Optional validation rule for the text content */
    rule?: TextRule;
    /** Optional array of conditional styles based on text rules */
    styles?: ConditionalStyle<TextRule>[];
};

/** Identifies a numeric type in the type system */
export const NumericTypeName = 'numeric';
/** 
 * Numeric data type for numbers and calculations
 * Supports formatting options, validation rules, and computed expressions
 */
export type NumericType = {
    name: typeof NumericTypeName;
    /** Optional validation rule for the numeric value */
    rule?: NumericRule;
    /** Optional array of conditional styles based on numeric rules */
    styles?: ConditionalStyle<NumericRule>[];
    /** Optional formatting for how the number should be displayed */
    format?: NumericFormat | Reference;
};

/** Identifies a temporal type in the type system */
export const TemporalTypeName = 'temporal';
/** 
 * Temporal data type for dates and times
 * Supports multiple format options, validation rules, and computed expressions
 */
export type TemporalType = {
    name: typeof TemporalTypeName;
    /** Optional validation rule for the temporal value */
    rule?: TemporalRule;
    /** Optional array of conditional styles based on temporal rules */
    styles?: ConditionalStyle<TemporalRule>[];
    /** Optional formatting for how the date/time should be displayed */
    format?: TemporalFormat | Reference;
};


/** 
 * Represents a single value in an enum type
 * Can be either a simple string or an object with an associated style
 */
export type EnumItem = string | { value: string; style?: Style | Reference; };

/** Identifies an enum type in the type system */
export const EnumTypeName = 'enum';
/** 
 * Enumerated data type with a fixed set of possible values
 * Each value can have its own style
 */
export type EnumType = {
    name: typeof EnumTypeName;
    /** Array of valid values for this enum */
    values: EnumItem[];
};


/** Identifies a lookup type in the type system */
export const LookupTypeType = 'lookup';
/** 
 * Lookup data type that references valid values from another column
 * Useful for maintaining consistency and relationships between columns
 */
export type LookupType = {
    name: typeof LookupTypeType;
    /** Column containing the valid values for this lookup */
    values: ColumnSelector;
};


/** 
 * Union of all possible data types in the system
 * Can be a concrete type definition or a reference to a predefined type
 */
export type DataType = TextType | NumericType | TemporalType | EnumType | LookupType | Reference;



/* Table Structures */

/** Regex pattern validating table unit names: must start with uppercase, followed by alphanumeric */
export const TableUnitNameRegex = /^[A-Z](A-Za-z0-9)*$/;

/** 
* Base type for all table structural elements (column, group, sheet)
* Provides common properties for naming, theming and description
*/
export type TableUnit = {
    /** Unique identifier following TableUnitNameRegex pattern */
    name: string;
    /** Optional theme override for this unit */
    theme?: Theme | StandardPaletteReference | Reference;
    /** Optional description of the unit's purpose */
    description?: string;
};

/** 
* Definition of a single column in a table
* Specifies the data type and optional metadata
*/
export type TableColumn = TableUnit & {
    /** Data type defining the content and behavior of this column */
    type: DataType;
    /** Optional metadata describing where the column's data comes from */
    source?: string;
    /** Optional expression to compute the value */
    expression?: Expression<DataSelector>;
};

/** 
* Groups related columns together
* Groups are hidden in the output if there's only one in a sheet, so the name doesn't matter (can be '')
*/
export type TableGroup = TableUnit & {
    /** Array of columns belonging to this group */
    columns: TableColumn[];
};

/** 
* Definition of a single sheet in the workbook
* Contains one table with one or more column groups
*/
export type TableSheet = TableUnit & {
    /** Array of column groups in this sheet's table */
    groups: TableGroup[];
    /** Number of data rows in the table */
    rows: number;
};

/** 
* Container for reusable definitions
* Enables referencing common elements across the TableBook
*/
export type Definitions = {
    /** Custom color definitions supplementing StandardPalettes */
    colors?: Record<string, Color>;
    /** Reusable style definitions */
    styles?: Record<string, Style | HeaderStyle>;
    /** Custom theme definitions supplementing standard palettes */
    themes?: Record<string, Theme>;
    /** Format definitions for numbers and dates */
    formats?: {
        /** Custom numeric format definitions */
        numeric?: Record<string, NumericFormat>;
        /** Custom temporal format definitions supplementing StandardTemporalFormats */
        temporal?: Record<string, TemporalFormat>;
    };
    /** Reusable type definitions */
    types?: Record<string, DataType>;
};

/** 
* Root type representing an entire workbook
* Contains all sheets and shared definitions
*/
export type TableBook = TableUnit & {
    /** Array of sheets in this workbook */
    sheets: TableSheet[];
    /** Optional container for reusable definitions */
    definitions?: Definitions;
};