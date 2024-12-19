/* Reference */

import { ColorHex } from "../util/Color";

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

export const TextFormShortcuts = ['n', 'b', 'i', 'bi'] as const;

export type TextForm = { bold?: boolean; italic?: boolean; } | typeof TextFormShortcuts[number];

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
    tab?: Color | Reference;
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
};

const makeStandardTheme = (darkest: Color, dark: Color, normal: Color, lightest: Color): CustomTheme => {
    return {
        tab: normal,
        group: { back: darkest },
        header: { back: dark },
        data: { back: lightest },
    };
};

export const StandardThemes = {
    redberry: makeStandardTheme('#5B0F00', '#85200C', '#B54531', '#E6B8AF'),
    red: makeStandardTheme('#660000', '#990000', '#CC3333', '#F4CCCC'),
    coral: makeStandardTheme('#652b2b', '#af4a4a', '#d47777', '#ffd7d7'),
    bronze: makeStandardTheme('#5D4037', '#895d4d', '#B17F6D', '#D7CCC8'),
    orange: makeStandardTheme('#783F04', '#B45F06', '#E67E0D', '#FCE5CD'),
    rust: makeStandardTheme('#8B3103', '#B54D18', '#D66830', '#F5DEB3'),
    yellow: makeStandardTheme('#7F6000', '#BF9000', '#E6B517', '#FFF2CC'),
    green: makeStandardTheme('#274E13', '#38761D', '#4F9C28', '#D9EAD3'),
    moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#5BA56B', '#D4E4D4'),
    sage: makeStandardTheme('#38471f', '#596f34', '#7A944A', '#D5E8D4'),
    slate: makeStandardTheme('#223939', '#2f4f4f', '#446464', '#E0E6E6'),
    cyan: makeStandardTheme('#0C343D', '#134F5C', '#1B697A', '#D0E0E3'),
    cornflowerblue: makeStandardTheme('#1C4587', '#1155CC', '#3377DD', '#C9DAF8'),
    blue: makeStandardTheme('#073763', '#0B5394', '#1976D2', '#CFE2F3'),
    lavender: makeStandardTheme('#3f3677', '#5f51b7', '#8070D8', '#E6E6FA'),
    plum: makeStandardTheme('#4E1A45', '#6C3483', '#8F4BAB', '#E8DAEF'),
    magenta: makeStandardTheme('#4C1130', '#65183E', '#8F2657', '#B3A0A8'),
    purple: makeStandardTheme('#20124D', '#351C75', '#4C2BA0', '#D9D2E9'),
    gray: makeStandardTheme('#3b3b3b', '#656565', '#8C8C8C', '#F2F2F2'),
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

export const BetweenOperator = 'between';
export type BetweenRule<T extends Comparable> = { type: typeof BetweenOperator; low: T; high: T; };



export const MatchOperators = ['contains', 'begins', 'ends'] as const;
export type MatchRule = { type: typeof MatchOperators[number]; value: string; };

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

export const UnitLengths = ['short', 'long'] as const;
export type UnitLength = typeof UnitLengths[number];

export const NumberDateFormatType = 'numberdate';
export const NumberDateFormatOrder = ['YMD', 'MDY', 'DMY'] as const; // Default: YMD (Y-M-D or M/D/Y or D.M.Y)
export type NumberDateFormat = {
    type: typeof NumberDateFormatType;
    year?: UnitLength;                                      // Year configuration (e.g., 2025 or 25)
    month?: UnitLength;                                     // Month configuration (e.g., 01 or 1)
    day?: UnitLength;                                       // Day configuration (e.g., 01 or 1)
    order?: typeof NumberDateFormatOrder[number];           // Order of date components
};

export const TextDateFormatType = 'textdate';
export const TextDateFormatOrder = ['DM', 'MD'] as const;     // Default: DM (D M, or M D)
export type TextDateFormat = {
    type: typeof TextDateFormatType;
    weekday?: UnitLength;                                 // Weekday name (e.g., Mon/Monday)
    month?: UnitLength;                                   // Month as words (e.g., Mar/March)
    year?: UnitLength;                                    // Year configuration
    day?: UnitLength;                                     // Day configuration (e.g., 1 or 01)
    order?: typeof TextDateFormatOrder[number];           // MD (Month, Day) or DM (Day Month)
};


export const StandardDateFormats = {
    // Numeric Date Formats
    ISODate: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'YMD' },
    ShortUSDate: { type: 'numberdate', year: 'short', month: 'short', day: 'short', order: 'MDY' },
    LongUSDate: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'MDY' },
    EuroDate: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'DMY' },

    // Text Date Formats
    LongTextDate: { type: 'textdate', weekday: 'long', month: 'long', day: 'short', year: 'long', order: 'MD' },
    ShortTextDate: { type: 'textdate', weekday: 'short', month: 'short', day: 'short', year: 'short', order: 'DM' },
} as const satisfies Record<string, TextDateFormat | NumberDateFormat>;


export type DateFormat = TextDateFormat | NumberDateFormat | keyof typeof StandardDateFormats;

export const HourFormats = ['standard', 'military'] as const;
export const NumberTimeFormatType = 'time';
export type NumberTimeFormat = {
    type: typeof NumberTimeFormatType;
    format: typeof HourFormats[number];              // Time format (standard or military)
    hours?: UnitLength;                             // Hours configuration (e.g., 5 or 05)
    minutes?: UnitLength;                           // Minutes configuration (e.g., 5 or 05)
    seconds?: UnitLength;                           // Seconds configuration (e.g., 5 or 05)
    milliseconds?: 1 | 2 | 3;                       // Optional precision level
};

export const StandardTimeFormats = {
    // Time Formats
    ShortStandardTime: { type: 'time', format: 'standard', hours: 'short', minutes: 'short', seconds: 'short' },
    ShortMilitaryTime: { type: 'time', format: 'military', hours: 'short', minutes: 'short', seconds: 'short' },
    LongStandardTime: { type: 'time', format: 'standard', hours: 'long', minutes: 'long', seconds: 'long' },
    LongMilitaryTime: { type: 'time', format: 'military', hours: 'long', minutes: 'long', seconds: 'long' },

} as const satisfies Record<string, NumberTimeFormat>;

export type TimeFormat = NumberTimeFormat | keyof typeof StandardTimeFormats;

export const DateTimeFormatType = 'datetime';
export type DateTimeFormat = {
    type: typeof DateTimeFormatType;
    date: DateFormat;
    time: TimeFormat;
};

export type TemporalFormat =
    | DateFormat
    | TimeFormat
    | DateTimeFormat
    ;

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
export const TableUnitNameRegex = /^[A-Z](A-Za-z0-9)*$/;
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
