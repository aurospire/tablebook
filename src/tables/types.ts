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
// +|- is relative offset, $ means absolute index
export type UnitSelector = `${'+' | '-' | '$'}${number}`;

// Targets a range of rows within a column using two endpoints.
// The `from` and `to` endpoints can be in any order; the compiler determines the correct range.
export const RangeRowSelectorType = 'range';
export type RangeRowSelector = {
    type: typeof RangeRowSelectorType; // Specifies that this selector targets a range.
    from: UnitSelector;  // One boundary of the range.
    to: UnitSelector;    // The other boundary of the range.
};

// Targets rows in a column using a single position, a range, or `self` for the element's row.
export type RowSelector = UnitSelector | RangeRowSelector | SelfSelector;

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


export type Theme = {
    inherits?: (StandardThemeReference | Reference)[]; // Deep overriding (into styles and borders)
    tab?: Color | Reference;
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
};

const makeStandardTheme = (darkest: Color, dark: Color, normal: Color, lightest: Color): Theme => {
    return {
        tab: normal,
        group: { back: darkest },
        header: { back: dark },
        data: { back: lightest },
    };
};

export const StandardThemes = {
    // Reds
    cranberry: makeStandardTheme('#5B0F10', '#791A15', '#A32E30', '#F4C2B5'), // Dark maroon tones
    red: makeStandardTheme('#660000', '#880000', '#C32222', '#F8C5C5'), // Classic red shades
    coral: makeStandardTheme('#762F2F', '#AF4A4A', '#D36868', '#FFE0DC'), // Warm reddish-pink
    terracotta: makeStandardTheme('#713F2D', '#9C5F4E', '#C87561', '#FAD9CE'), // Earthy orange-red

    // Oranges and Yellows
    rust: makeStandardTheme('#8B3103', '#B54D18', '#D65C2B', '#F7D5BC'), // Deep orange-brown
    orange: makeStandardTheme('#783F04', '#B45F06', '#E6751A', '#FDD9BC'), // Bold orange shades
    yellow: makeStandardTheme('#856500', '#BF9000', '#E6AC1E', '#FFF2C4'), // Golden yellow tones

    // Greens
    green: makeStandardTheme('#294E13', '#38761D', '#4B9022', '#D6E8CE'), // Deep forest green
    moss: makeStandardTheme('#1E4D2B', '#3A7A47', '#519563', '#D4E8D1'), // Cool earthy green
    sage: makeStandardTheme('#38471F', '#596F34', '#788F4A', '#DCEADF'), // Muted green tones

    // Blues
    teal: makeStandardTheme('#004548', '#006E6E', '#008F8F', '#D1F0EC'), // Deep blue-green
    slate: makeStandardTheme('#2A4545', '#366060', '#507878', '#DEE8E8'), // Muted gray-blue
    cyan: makeStandardTheme('#0C343D', '#134F5C', '#1B657A', '#CBE5E8'), // Fresh blue-green
    blue: makeStandardTheme('#073763', '#0B5394', '#1763B8', '#CEE2F0'), // Classic blue shades
    azure: makeStandardTheme('#123A75', '#1E5BAA', '#2D70C8', '#D0E2F4'), // Bright sky blue
    skyblue: makeStandardTheme('#004080', '#0066CC', '#2E8FEA', '#D0E6F8'), // Light sky blue

    // Purples and Magentas
    purple: makeStandardTheme('#20124D', '#351C75', '#483CA4', '#D5D0E3'), // Deep purple shades
    lavender: makeStandardTheme('#3F3677', '#5F51B7', '#776CCF', '#DAD5F2'), // Soft lavender tones
    plum: makeStandardTheme('#4E1A45', '#6C3483', '#8E4FA8', '#E7D0EA'), // Warm purple-pink
    magenta: makeStandardTheme('#541436', '#6D1C44', '#912651', '#F3D4DE'), // Bold pink-purple
    rose: makeStandardTheme('#682F42', '#8D4659', '#A85475', '#F5D4DC'), // Soft pink-red

    // Neutrals
    sand: makeStandardTheme('#6A5D47', '#8C755D', '#B5937A', '#EDE0D2'), // Warm beige tones
    bronze: makeStandardTheme('#5D4037', '#895D4D', '#A6705F', '#EAD6C7'), // Metallic brown
    taupe: makeStandardTheme('#483C32', '#6B5D4F', '#857667', '#E5DBD1'), // Neutral brown-gray
    gray: makeStandardTheme('#3B3B3B', '#656565', '#7E7E7E', '#E8E8E8'), // Neutral gray shades
    charcoal: makeStandardTheme('#2A2A2A', '#4D4D4D', '#676767', '#E2E2E2'), // Deep gray tones
} as const;

export type StandardThemeReference = Reference<keyof typeof StandardThemes>;


/* Operators */
export const ComparisonOperators = ['=', '>', '<', '>=', '<=', '<>'] as const;
export type ComparisonOperator = typeof ComparisonOperators[number];

export const IntegrativeOperators = ['+', '-', '*', '/', '^', '&'] as const;
export type IntegrativeOperator = typeof IntegrativeOperators[number];

export type Operator = ComparisonOperator | IntegrativeOperator;


/* Expressions */
export const CompoundExpressionType = 'compound';
export type CompoundExpression<Selector> = {
    type: typeof CompoundExpressionType;
    with: Operator;
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
export type CustomRule = { type: typeof CustomRuleType; expression: Expression<DataSelector>; };


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
    iso: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'YMD' },
    eurolong: { type: 'numberdate', year: 'short', month: 'short', day: 'short', order: 'DMY' },
    euroshort: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'DMY' },
    usshort: { type: 'numberdate', year: 'short', month: 'short', day: 'short', order: 'MDY' },
    uslong: { type: 'numberdate', year: 'long', month: 'long', day: 'long', order: 'MDY' },

    // Text Date Formats
    textshort: { type: 'textdate', weekday: 'short', month: 'short', day: 'short', year: 'short', order: 'DM' },
    textlong: { type: 'textdate', weekday: 'long', month: 'long', day: 'short', year: 'long', order: 'MD' },
} as const satisfies Record<string, TextDateFormat | NumberDateFormat>;


export type StandardDateReference = Reference<keyof typeof StandardDateFormats>;

export type DateFormat = TextDateFormat | NumberDateFormat;

export const HourFormats = ['standard', 'military'] as const;
export const TimeFormatType = 'time';
export type TimeFormat = {
    type: typeof TimeFormatType;
    format?: typeof HourFormats[number];            // Time format (standard or military)
    hours?: UnitLength;                             // Hours configuration (e.g., 5 or 05)
    minutes?: UnitLength;                           // Minutes configuration (e.g., 5 or 05)
    seconds?: UnitLength;                           // Seconds configuration (e.g., 5 or 05)
    milliseconds?: 1 | 2 | 3;                       // Optional precision level
};

export const StandardTimeFormats = {
    // Time Formats
    standardshort: { type: 'time', format: 'standard', hours: 'short', minutes: 'short', seconds: 'short' },
    standardlong: { type: 'time', format: 'standard', hours: 'long', minutes: 'long', seconds: 'long' },
    militaryshort: { type: 'time', format: 'military', hours: 'short', minutes: 'short', seconds: 'short' },
    militarylong: { type: 'time', format: 'military', hours: 'long', minutes: 'long', seconds: 'long' },

} as const satisfies Record<string, TimeFormat>;

export type StandardTimeReference = Reference<keyof typeof StandardTimeFormats>;


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

export type NumericReference =
    | StandardDateReference
    | StandardTimeReference

export type NumericFormat =
    | NumberFormat
    | PercentFormat
    | CurrencyFormat
    | TemporalFormat
    ;


/* Data Types */
export const TextTypeType = 'text';
export type TextType = {
    type: typeof TextTypeType;
    expression?: Expression<DataSelector>;
    rules?: TextRule[];
    styles?: ConditionalStyle<TextRule>[];
};

export const NumericTypeType = 'numeric';
export type NumericType = {
    type: typeof NumericTypeType;
    expression?: Expression<DataSelector>;
    rules?: NumericRule[];
    styles?: ConditionalStyle<NumericRule>[];
    format?: NumericFormat | NumericReference | Reference;
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
    theme?: Theme | StandardThemeReference | Reference;
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
    themes?: Record<string, Theme>; // Includes Standard Themes by default
    formats?: Record<string, NumericFormat>; // Includes Standard Formats by default
    types?: Record<string, DataType>;
};

export type TableBook = TableUnit & {
    sheets: TableSheet[];
    definitions?: Definitions;
};
