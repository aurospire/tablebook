// Types for TableBook - a declarative schema (like DDL for databases) for one-time spreadsheet generation. 
// Each sheet has one table with at least one column group. 

/* Reference */
// Used to Reference context dependent items (color,style,theme,type) defined in TableBook Definition object
export const ReferenceRegex = /^@.+$/;
export type Reference<Set extends string = string> = `@${Set}`;


/* Data Selector */
// Selectors are used to target data within a single column of a table.
// They define relationships between columns and rows relative to an element in the table paradigm.
// An element represents the intersection of a column and a row, without implying a grid-like structure.
// Selection is column-based; multi-column or horizontal selection is not supported.

// Refers to the current element in the scope where it is used.
export const SelfLiteral = 'self';
export type SelfSelector = 'self';

// Identifies a specific column by name, optionally specifying its table and group.
// Defaults to the element's table and group if not provided.
export type ColumnSelector = {
    table?: string; // The table containing the column; defaults to the element's table.
    group?: string; // The group containing the column; defaults to the element's group.
    column: string; // The name of the column (required).
};

// Targets a single row in a column using absolute or relative indexing.
export const UnitSelectorRegex = /^(\+|\-|\$)(\d+)$/;
export type UnitPrefix = '+' | '-' | '$';
// +|- is relative offset, $ means absolute index
export type UnitSelector = `${UnitPrefix}${number}`;

// Targets a range of rows within a column using two endpoints.
// The `from` and `to` endpoints can be in any order; the compiler determines the correct range.
export const RangeRowSelectorType = 'range';
export type RangeRowSelector = {
    type: typeof RangeRowSelectorType; // Specifies that this selector targets a range.
    from: UnitSelector;  // One boundary of the range.
    to: UnitSelector;    // The other boundary of the range.
};

// Targets rows in a column using a single position or a range.
export type RowSelector = UnitSelector | RangeRowSelector;

// Combines column and row selection to target data within a table.
// Selects the entire column by default; limits to specific rows if `row` is provided.
export type DataSelector = {
    column: ColumnSelector | SelfSelector;  // The column to target; defaults to the element's column if `self`.
    row?: RowSelector | SelfSelector;       // Optional filter for rows; defaults to the entire column if not provided, or the element's row if `self`.
} | SelfSelector; // Refers to the entire element, including its column and row.


/* Styling */
export const ColorRegex = /^#[A-Za-z0-9]{6}$/;
export type Color = `#${string}`;

export const palette = (
    darkest: Color,
    dark: Color,
    main: Color,
    lightest: Color
) => ({ darkest, dark, main, lightest });

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
} as const;

export type StandardPaletteReference = Reference<keyof typeof StandardPalettes>;

export type TextForm = boolean | { bold?: boolean; italic?: boolean; };

export type Style = {
    fore?: Color | StandardPaletteReference | Reference; // defaults to black
    back?: Color | StandardPaletteReference | Reference; // defaults to white
    form?: TextForm; // defaults to false
};

export const BorderTypes = ['none', 'thin', 'medium', 'thick', 'dotted', 'dashed', 'double'] as const;

export type BorderType = typeof BorderTypes[number];

export type Border = {
    type: BorderType;
    color?: Color | StandardPaletteReference | Reference;  // defaults to black    
};

export type Partition = {
    below?: Border; // Border below the Group-Header or Column-Header
    between?: Border; // Border between the Groups-Columns or individual Columns
};

export type HeaderStyle = Style & { partition?: Partition; };


export type Theme = {
    // StandardPaletteReferences here map to darkest:group,dark:header,main:data,lightest:tab
    inherits?: (StandardPaletteReference | Reference)[]; // Deep overriding - not shallow, order matters
    tab?: Color | StandardPaletteReference | Reference;
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
};


/* Operators */
export const ComparisonOperators = ['=', '<>', '>', '<', '>=', '<='] as const;
export type ComparisonOperator = typeof ComparisonOperators[number];

export const MergeOperators = ['+', '-', '*', '/', '^', '&'] as const;
export type MergeOperator = typeof MergeOperators[number];


/* Expressions */
export const CompoundExpressionType = 'compound';
export type CompoundExpression<Selector> = {
    type: typeof CompoundExpressionType;
    with: ComparisonOperator | MergeOperator;
    items: Expression<Selector>[];
};

export const NegatedExpressionType = 'negated';
export type NegatedExpression<Selector> = {
    type: typeof NegatedExpressionType;
    on: Expression<Selector>;
};

export const FunctionExpressionType = 'function';
export type FunctionExpression<Selector> = {
    type: typeof FunctionExpressionType;
    name: string;
    args: Expression<Selector>[];
}; // NO HARDCODED - ITS UP TO USERS TO MAKE SURE FUNCTIONS ARE VALID

export const SelectorExpressionType = 'selector';
export type SelectorExpression<Selector> = { type: typeof SelectorExpressionType; from: Selector; };

export type SelfExpression = { type: typeof SelfLiteral; };

export type LiteralExpression = string | number | boolean;

export type Expression<Selector> =
    | CompoundExpression<Selector>
    | NegatedExpression<Selector>
    | FunctionExpression<Selector>
    | SelectorExpression<Selector>
    | LiteralExpression
    | SelfExpression;


/* Data Rules */
export const TemporalStringRegex = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2})?$/;
export type DateString = `${number}-${number}-${number}`;
export type DateTimeString = `${DateString}${'T' | ' '}${number}:${number}:${number}`;
export type TemporalString = DateString | DateTimeString;

export type ComparisonRule<T> = { type: ComparisonOperator; to: T; };

export const CustomRuleType = 'custom';
export type CustomRule = { type: typeof CustomRuleType; expression: Expression<DataSelector>; };


export const RangeOperators = ['between', 'outside'] as const;
export type RangeOperator = typeof RangeOperators[number];
export type RangeRule<T> = { type: RangeOperator; low: T; high: T; };

export type NumericRule = ComparisonRule<number> | RangeRule<number> | CustomRule;

export type TemporalRule = ComparisonRule<TemporalString> | RangeRule<TemporalString> | CustomRule;


export const MatchOperators = ['contains', 'begins', 'ends'] as const;
export type MatchOperator = typeof MatchOperators[number];
export type MatchRule = { type: MatchOperator; value: string; };

export type TextRule = MatchRule | CustomRule;


export type ConditionalStyle<Rule> = {
    on: Rule;
    style: Style | Reference;
};


/* Numeric Formats */
export type DigitPlaceholder = {
    fixed?: number; // '0' in NumericFormat
    flex?: number;  // '#' in NumericFormat
    align?: number; // '?' in NumericFormat
};

export type BaseNumberFormat<Type extends string> = {
    type: Type;
    integer?: number | DigitPlaceholder;
    decimal?: number | DigitPlaceholder;
    commas?: boolean; // Separate thousands with ','
};

export const NumberFormatType = 'number';
export type NumberFormat = BaseNumberFormat<typeof NumberFormatType>;

export const PercentFormatType = 'percent';
export type PercentFormat = BaseNumberFormat<typeof PercentFormatType>;

export const CurrencyFormatType = 'currency';
export const CurrencySymbolPositions = ['prefix', 'suffix'] as const;
export type CurrencyFormat = BaseNumberFormat<typeof CurrencyFormatType> & {
    symbol?: string; // defaults to '$'
    position?: typeof CurrencySymbolPositions[number];
};

export type NumericFormat =
    | NumberFormat
    | PercentFormat
    | CurrencyFormat
    ;


/* Temporal Formats */
export const TemporalUnitLengths = ['short', 'long'] as const;
export type TemporalUnitLength = typeof TemporalUnitLengths[number];

export const TemporalUnitTypes = ['year', 'month', 'monthname', 'weekday', 'day', 'hour', 'meridiem', 'minute', 'second'] as const;
export type TemporalUnitType = typeof TemporalUnitTypes[number];

export type TemporalUnit = { type: TemporalUnitType, length: TemporalUnitLength; };

export type TemporalItem = TemporalUnit | string;

export type TemporalFormat = TemporalItem[];

const tu = (type: TemporalUnitType, length: TemporalUnitLength = 'short'): TemporalUnit => ({ type, length });

export const StandardTemporalFormats = {
    isodate: [tu('year'), '-', tu('month'), '-', tu('day')], // "YYYY-MM-DD"
    isodatetime: [tu('year'), '-', tu('month'), '-', tu('day'), 'T', tu('hour'), ':', tu('minute'), ':', tu('second')], // "YYYY-MM-DDTHH:mm:ss"

    eurolongdate: [tu('day'), ' ', tu('monthname', 'long'), ' ', tu('year', 'long')], // "dd MMMM yyyy"
    euroshortdate: [tu('day'), '/', tu('month'), '/', tu('year')], // "dd/MM/yyyy"

    uslongdate: [tu('monthname', 'long'), ' ', tu('day'), ', ', tu('year', 'long')], // "MMMM dd, yyyy"
    usshortdate: [tu('month'), '/', tu('day'), '/', tu('year')], // "MM/dd/yyyy"

    textlongdate: [tu('weekday', 'long'), ', ', tu('monthname', 'long'), ' ', tu('day'), ', ', tu('year', 'long')], // "Sunday, September 24, 2023"
    textshortdate: [tu('weekday'), ', ', tu('monthname'), ' ', tu('day'), ', ', tu('year')], // "Sun, Sep 24, 2023"
} as const;

export type StandardFormatReference = Reference<keyof typeof StandardTemporalFormats>;


/* Data Types */
export const TextTypeType = 'text';
export type TextType = {
    type: typeof TextTypeType;
    expression?: Expression<DataSelector>;
    rule?: TextRule;
    styles?: ConditionalStyle<TextRule>[];
};

export const NumericTypeType = 'numeric';
export type NumericType = {
    type: typeof NumericTypeType;
    expression?: Expression<DataSelector>;
    rule?: NumericRule;
    styles?: ConditionalStyle<NumericRule>[];
    format?: NumericFormat | Reference;
};

export const TemporalTypeType = 'temporal';
export type TemporalType = {
    type: typeof TemporalTypeType;
    expression?: Expression<DataSelector>;
    rule?: TemporalRule;
    styles?: ConditionalStyle<TemporalRule>[];
    format?: TemporalFormat | StandardFormatReference | Reference;
};

export type EnumItem = string | { value: string; style?: Style | Reference; };

export const EnumTypeType = 'enum';
export type EnumType = {
    type: typeof EnumTypeType;
    values: EnumItem[];
};

export const LookupTypeType = 'lookup';
export type LookupType = {
    type: typeof LookupTypeType;
    values: ColumnSelector;
};

export type DataType = TextType | NumericType | TemporalType | EnumType | LookupType | Reference;


/* Table Structures */
export const TableUnitNameRegex = /^[A-Z](A-Za-z0-9)*$/;
export type TableUnit = {
    name: string;
    theme?: Theme | StandardPaletteReference | Reference;
    description?: string; // meta description of column
};

export type TableColumn = TableUnit & {
    type: DataType;
    source?: string; // meta description of source of data
};

// Group of Columns
export type TableGroup = TableUnit & {
    columns: TableColumn[];
};

export type TableSheet = TableUnit & {
    groups: TableGroup[];
    rows: number;
};

// Definitions table allows reuse/inheritence of commonly used colors,styles,themes and types via References
export type Definitions = {
    colors?: Record<string, Color>; // Includes Standard Colors by default
    styles?: Record<string, Style | HeaderStyle>;
    themes?: Record<string, Theme>; // Includes Standard Colors by default
    formats?: {
        numeric?: Record<string, NumericFormat>;
        temporal?: Record<string, TemporalFormat>; // Includes Standard Formats by default
    };
    types?: Record<string, DataType>;
};

export type TableBook = TableUnit & {
    sheets: TableSheet[];
    definitions?: Definitions;
};
