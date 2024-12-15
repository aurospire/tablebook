/* Reference */
// Used to Reference context dependent items (color,style,theme,type) defined in TableBook Definition object
export const ReferenceRegex = /^@.+$/;
export type Reference = `@${string}`;


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
export const UnitRowSelectorTypes = ['index', 'offset'] as const;
export type UnitRowSelector = {
    type: typeof UnitRowSelectorTypes[number]; // 'index' for absolute or 'offset' for relative positioning.
    value: number;  // The absolute index or offset value.
};

// Targets a range of rows within a column using two endpoints.
// The `from` and `to` endpoints can be in any order; the compiler determines the correct range.
export const RangeRowSelectorType = 'range';
export type RangeRowSelector = {
    type: typeof RangeRowSelectorType; // Specifies that this selector targets a range.
    from: UnitRowSelector;  // One boundary of the range.
    to: UnitRowSelector;    // The other boundary of the range.
};

// Targets rows in a column using a single position, a range, or `self` for the element's row.
export type RowSelector = UnitRowSelector | RangeRowSelector | SelfSelector;

// Combines column and row selection to target data within a table.
// Selects the entire column by default; limits to specific rows if `row` is provided.
export type DataSelector = {
    column: ColumnSelector | SelfSelector;  // The target column, specified explicitly or as the element's column (`self`).
    row?: RowSelector | SelfSelector;       // Optional filter for rows; defaults to the entire column if not provided.
} | SelfSelector; // Refers to the entire element, including its column and row.



/* Styling */
export const ColorRegex = /^#[A-Za-z0-9]{6}$/;
export type Color = `#${string}`;

export type TextForm = boolean | { bold?: boolean; italic?: boolean; };

export type Style = {
    fore?: Color | Reference; // defaults to black
    back?: Color | Reference; // defaults to white
    form?: TextForm; // defaults to false
};

export const BorderTypes = ['none', 'thin', 'medium', 'thick', 'dotted', 'dashed', 'double'] as const;

export type BorderType = typeof BorderTypes[number];

export type Border = {
    type: BorderType;
    color?: Color | Reference;  // defaults to black    
};

export type Partition = {
    below?: Border; // Border below the Group-Header or Column-Header
    between?: Border; // Border between the Groups-Columns or individual Columns
};

export type HeaderStyle = Style & { partition?: Partition; };


export type CustomTheme = {
    inherits?: Reference | Reference[]; // Deep overriding (into styles and borders)
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
};

const makeStandardTheme = (group: Color, header: Color, data: Color): CustomTheme => {
    return {
        group: { back: group },
        header: { back: header },
        data: { back: data },
    };
};

export const StandardThemes = {
    // redberry:       makeStandardTheme('#5B0F00', '#85200C', '#E6B8AF'),
    // red:            makeStandardTheme('#660000', '#990000', '#F4CCCC'),
    // orange:         makeStandardTheme('#783F04', '#B45F06', '#FCE5CD'),
    // terracotta:     makeStandardTheme('#602A15', '#8A4F3A', '#F3E0D7'),
    // yellow:         makeStandardTheme('#7F6000', '#BF9000', '#FFF2CC'),
    // green:          makeStandardTheme('#274E13', '#38761D', '#D9EAD3'),
    // cyan:           makeStandardTheme('#0C343D', '#134F5C', '#D0E0E3'),
    // cornflowerblue: makeStandardTheme('#1C4587', '#1155CC', '#C9DAF8'),
    // blue:           makeStandardTheme('#073763', '#0B5394', '#CFE2F3'),
    // purple:         makeStandardTheme('#20124D', '#351C75', '#D9D2E9'),
    // magenta:        makeStandardTheme('#4C1130', '#65183E', '#B3A0A8'),
    // gray:           makeStandardTheme('#4D4D4D', '#808080', '#F2F2F2'),

    // redberry:       makeStandardTheme('#5B0F00', '#85200C', '#E6B8AF'),
    // red:            makeStandardTheme('#660000', '#990000', '#F4CCCC'),
    // coral:          makeStandardTheme('#652b2b', '#af4a4a', '#ffd7d7'),
    // bronze:         makeStandardTheme('#5D4037', '#895d4d', '#D7CCC8'),
    // orange:         makeStandardTheme('#783F04', '#B45F06', '#FCE5CD'),
    // rust:           makeStandardTheme('#8B3103', '#B54D18', '#F5DEB3'),
    // yellow:         makeStandardTheme('#7F6000', '#BF9000', '#FFF2CC'),
    // green:          makeStandardTheme('#274E13', '#38761D', '#D9EAD3'),
    // moss:           makeStandardTheme('#1E4D2B', '#3A7A47', '#D4E4D4'),
    // sage:           makeStandardTheme('#38471f', '#596f34', '#D5E8D4'),
    // slate:          makeStandardTheme('#223939', '#2f4f4f', '#E0E6E6'),
    // cyan:           makeStandardTheme('#0C343D', '#134F5C', '#D0E0E3'),
    // cornflowerblue: makeStandardTheme('#1C4587', '#1155CC', '#C9DAF8'),
    // blue:           makeStandardTheme('#073763', '#0B5394', '#CFE2F3'),
    // lavender:       makeStandardTheme('#3f3677', '#5f51b7', '#E6E6FA'),
    // plum:           makeStandardTheme('#4E1A45', '#6C3483', '#E8DAEF'),
    // magenta:        makeStandardTheme('#4C1130', '#65183E', '#B3A0A8'),
    // purple:         makeStandardTheme('#20124D', '#351C75', '#D9D2E9'),
    // gray:           makeStandardTheme('#3b3b3b', '#656565', '#F2F2F2'),

    redberry: makeStandardTheme('#5B0F00', '#85200C', '#E6B8AF'),
    red: makeStandardTheme('#660000', '#990000', '#F4CCCC'),
    coral: makeStandardTheme('#652b2b', '#af4a4a', '#ffd7d7'),
    bronze: makeStandardTheme('#5D4037', '#895d4d', '#D7CCC8'),
    orange: makeStandardTheme('#783F04', '#B45F06', '#FCE5CD'),
    rust: makeStandardTheme('#8B3103', '#B54D18', '#F5DEB3'),
    yellow: makeStandardTheme('#7F6000', '#BF9000', '#FFF2CC'),
    green: makeStandardTheme('#274E13', '#38761D', '#D9EAD3'),
    moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#D4E4D4'),
    sage: makeStandardTheme('#38471f', '#596f34', '#D5E8D4'),
    slate: makeStandardTheme('#223939', '#2f4f4f', '#E0E6E6'),
    cyan: makeStandardTheme('#0C343D', '#134F5C', '#D0E0E3'),
    cornflowerblue: makeStandardTheme('#1C4587', '#1155CC', '#C9DAF8'),
    blue: makeStandardTheme('#073763', '#0B5394', '#CFE2F3'),
    lavender: makeStandardTheme('#3f3677', '#5f51b7', '#E6E6FA'),
    plum: makeStandardTheme('#4E1A45', '#6C3483', '#E8DAEF'),
    magenta: makeStandardTheme('#4C1130', '#65183E', '#B3A0A8'),
    purple: makeStandardTheme('#20124D', '#351C75', '#D9D2E9'),
    gray: makeStandardTheme('#3b3b3b', '#656565', '#F2F2F2'),
} as const;

export type StandardTheme = keyof typeof StandardThemes;

export type Theme = CustomTheme | StandardTheme;


/* Operators */
export const ComparisonOperators = ['=', '>', '<', '>=', '<=', '<>'] as const;
export type ComparisonOperator = typeof ComparisonOperators[number];

export const IntegrativeOperators = ['+', '-', '*', '/', '^', '&'] as const;
export type IntegrativeOperator = typeof IntegrativeOperators[number];

export type Operator = ComparisonOperator | IntegrativeOperator;


/* Expressions */
export const CompoundExpressionType = 'compound';
export type CompoundExpression = { type: typeof CompoundExpressionType; with: Operator; left: Expression; right: Expression; };

export const NegatedExpressionType = 'negated';
export type NegatedExpression = { type: typeof NegatedExpressionType; on: Expression; };

export const FunctionExpressionType = 'function';
export type FunctionExpression = { type: typeof FunctionExpressionType; name: string; args: Expression[]; }; // NO HARDCODED - ITS UP TO USERS TO MAKE SURE FUNCTIONS ARE VALID

export const LiteralExpressionType = 'literal';
export type LiteralExpression = { type: typeof LiteralExpressionType; value: string | number | boolean; };

export const SelectorExpressionType = 'selector';
export type SelectorExpression = { type: typeof SelectorExpressionType; from: DataSelector; };

export type SelfExpression = { type: typeof SelfLiteral; };

export type Expression =
    | CompoundExpression
    | NegatedExpression
    | FunctionExpression
    | LiteralExpression
    | SelectorExpression
    | SelfExpression;


/* Data Rules */

// Rule[] => All(Rule) all must pass

export const DateStringRegex = /^\d{4}-\d{2}-d{2}$/;
export type DateString = `${number}-${number}-${number}`;

export const TimeStringRegex = /^\d{2}:\d{2}:d{2}$/;
export type TimeString = `${number}:${number}:${number}`;

export const DateTimeStringRegex = /^\d{4}-\d{2}-d{2} \d{2}:\d{2}:d{2}$/;
export type DateTimeString = `${DateString} ${TimeString}`;


export type Comparable = number | DateString | TimeString | DateTimeString;

export type ComparisonRule<T extends Comparable> = { type: ComparisonOperator; to: T; };

export const BetweenRuleType = 'between';
export type BetweenRule<T extends Comparable> = { type: typeof BetweenRuleType; low: T; high: T; };



export const MatchRuleTypes = ['contains', 'begins', 'ends'] as const;
export type MatchRule = { type: typeof MatchRuleTypes[number]; value: string; };

export const CustomRuleType = 'custom';
export type CustomRule = { type: typeof CustomRuleType; expression: Expression; };


export type NumericRule = ComparisonRule<Comparable> | BetweenRule<Comparable> | CustomRule;

export type TextRule = MatchRule | ComparisonRule<number> | BetweenRule<number> | CustomRule;


export type ConditionalStyle<Rule> = {
    on: Rule[]; // ALL Rules have to pass 
    style: Style | Reference;
};


/* Numeric Formats */
export type DigitPlaceholder = {
    fixed?: number; /** '0' in NumericFormat */
    flex?: number;  /** '#' in NumericFormat */
    align?: number; /** '?' in NumericFormat */
};

export const NegativeFormats = ['minus', 'enclosed'] as const;

export type BaseNumberFormat<Type extends string> = {
    type: Type;
    integer?: number | DigitPlaceholder;
    decimal?: number | DigitPlaceholder;
    commas?: boolean; /** Separate thousands with ',' */
    negatives?: typeof NegativeFormats[number]; // defaults to minus
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

export const DateFormats = Object.freeze({
    'ISODate': 'YYYY-MM-DD',
    'SlashedDate': 'MM/DD/YYYY',
    'EuropeanDate': 'DD/MM/YYYY',
    'LongDate': 'dddd, MMMM D, YYYY',
    'ShortLongDate': 'ddd, MMM D, YYYY',
    'MonthDayYear': 'MMM DD, YYYY',
    'DayMonthYear': 'DD MMM YYYY',
} as const);

export const TimeFormats = Object.freeze({
    '24HourTime': 'HH:mm',
    '12HourTime': 'h:mm AM/PM',
    '24HourTimeWithSeconds': 'HH:mm:ss',
    '12HourTimeWithSeconds': 'h:mm:ss AM/PM',
    '24HourTimeWithTenths': 'HH:mm:ss.S',
    '24HourTimeWithHundredths': 'HH:mm:ss.SS',
    '24HourTimeWithMilliseconds': 'HH:mm:ss.SSS',
} as const);

export type DateFormatString = typeof DateFormats[keyof typeof DateFormats];

export type TimeFormatString = typeof TimeFormats[keyof typeof TimeFormats];

// If neither date or time is supplied, goes with ISODate
export const TemporalFormatType = 'temporal';
export type TemporalFormat = {
    type: typeof TemporalFormatType;
    date?: DateFormatString;
    time?: TimeFormatString;
};

export type NumericFormat =
    | NumberFormat
    | PercentFormat
    | CurrencyFormat
    | TemporalFormat;


/* Data Types */
export const TextTypeType = 'text';
export type TextType = {
    type: typeof TextTypeType;
    expression?: Expression;
    rules?: TextRule[];
    styles?: ConditionalStyle<TextRule>[];
};

export const NumericTypeType = 'numeric';
export type NumericType = {
    type: typeof NumericTypeType;
    expression?: Expression;
    rules?: NumericRule[];
    styles?: ConditionalStyle<NumericRule>[];
    format?: NumericFormat;
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

export type DataType = TextType | NumericType | EnumType | LookupType | Reference;


/* Table Structures */
export const TableUnitNameRegex = /^[A-Z_](A-Za-z0-9_)*$/;
export type TableUnit = {
    name: string;
    theme?: Theme | Reference;
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
    colors?: Record<string, Color>;
    styles?: Record<string, Style | HeaderStyle>;
    themes?: Record<string, Theme>; // Includes Standard Themes by default, overriding them by name not allowed
    types?: Record<string, DataType>;
};

export type TableBook = TableUnit & {
    sheets: TableSheet[];
    definitions?: Definitions;
};
