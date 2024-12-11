/* Reference */
export type Reference = `@${string}`;

export type Inheritor = { inherit?: Reference; };

/* Data Reference */
export type Self = 'self';

export type ColumnReference = { table?: string; group?: string; column: string; };

export type PositionRowReference = { type: 'index' | 'offset'; value: number; };

export type RangeRowReference = { type: 'range'; start: RowReference; end: RowReference; };

export type RowReference = PositionRowReference | RangeRowReference;

export type DataReference = { column: ColumnReference | Self; row: RowReference | Self; } | Self;

/* Styling */
export type Color = `#${string}`;

export type TextForm = boolean | { bold?: boolean; italic?: boolean; };

export type BorderType = 'solid' | 'dotted' | 'dashed';

export type Style = Inheritor & {
    fore?: Color | Reference;
    back?: Color | Reference;
    form?: TextForm;
};

export type Border = Inheritor & {
    color?: Color | Reference;
    width?: number;
    type?: BorderType;
};

export type BorderSet = Inheritor & {
    below?: Border | Reference;
    between?: Border | Reference;
};

export type HeaderStyle = Style & { border?: BorderSet; };


export type CustomStyleSet = Inheritor & {
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
};

const makeStandardStyle = (group: Color, header: Color, data: Color): CustomStyleSet => {
    return {
        group: { fore: '#FFFFFF', back: group, form: { bold: true } },
        header: { fore: '#FFFFFF', back: header, form: { bold: true } },
        data: { fore: '#000000', back: data },
    };
};

export const StandardStyleSet = {
    // redberry:       makeStandardStyle('#5B0F00', '#85200C', '#E6B8AF'),
    // red:            makeStandardStyle('#660000', '#990000', '#F4CCCC'),
    // orange:         makeStandardStyle('#783F04', '#B45F06', '#FCE5CD'),
    // terracotta:     makeStandardStyle('#602A15', '#8A4F3A', '#F3E0D7'),
    // yellow:         makeStandardStyle('#7F6000', '#BF9000', '#FFF2CC'),
    // green:          makeStandardStyle('#274E13', '#38761D', '#D9EAD3'),
    // cyan:           makeStandardStyle('#0C343D', '#134F5C', '#D0E0E3'),
    // cornflowerblue: makeStandardStyle('#1C4587', '#1155CC', '#C9DAF8'),
    // blue:           makeStandardStyle('#073763', '#0B5394', '#CFE2F3'),
    // purple:         makeStandardStyle('#20124D', '#351C75', '#D9D2E9'),
    // magenta:        makeStandardStyle('#4C1130', '#65183E', '#B3A0A8'),
    // gray:           makeStandardStyle('#4D4D4D', '#808080', '#F2F2F2'),

    redberry:       makeStandardStyle('#5B0F00', '#85200C', '#E6B8AF'),
    red:            makeStandardStyle('#660000', '#990000', '#F4CCCC'),
    coral:          makeStandardStyle('#652b2b', '#af4a4a', '#ffd7d7'),
    bronze:         makeStandardStyle('#5D4037', '#895d4d', '#D7CCC8'),
    orange:         makeStandardStyle('#783F04', '#B45F06', '#FCE5CD'),
    rust:           makeStandardStyle('#8B3103', '#B54D18', '#F5DEB3'),
    yellow:         makeStandardStyle('#7F6000', '#BF9000', '#FFF2CC'),
    green:          makeStandardStyle('#274E13', '#38761D', '#D9EAD3'),
    moss:           makeStandardStyle('#1E4D2B', '#3A7A47', '#D4E4D4'),
    sage:           makeStandardStyle('#38471f', '#596f34', '#D5E8D4'),
    slate:          makeStandardStyle('#223939', '#2f4f4f', '#E0E6E6'),
    cyan:           makeStandardStyle('#0C343D', '#134F5C', '#D0E0E3'),
    cornflowerblue: makeStandardStyle('#1C4587', '#1155CC', '#C9DAF8'),
    blue:           makeStandardStyle('#073763', '#0B5394', '#CFE2F3'),
    lavender:       makeStandardStyle('#3f3677', '#5f51b7', '#E6E6FA'),
    plum:           makeStandardStyle('#4E1A45', '#6C3483', '#E8DAEF'),
    magenta:        makeStandardStyle('#4C1130', '#65183E', '#B3A0A8'),
    purple:         makeStandardStyle('#20124D', '#351C75', '#D9D2E9'),
    gray:           makeStandardStyle('#3b3b3b', '#656565', '#F2F2F2'),
} as const satisfies Record<string, CustomStyleSet>;

export type StandardStyleSet = keyof typeof StandardStyleSet;


export type StyleSet = StandardStyleSet | CustomStyleSet;

/* Operators */
export type ComparisonOperator = '=' | '>' | '<' | '>=' | '<=' | '<>';

export type ArithmeticOperator = '+' | '-' | '*' | '/' | '^';

export type ConcatOperator = '&';

export type Operator = ComparisonOperator | ArithmeticOperator | ConcatOperator;


/* Data Validation and Rules */
// Rule[] => All(Rule) all must pass

export type DateString = `${number}-${number}-${number}`;

export type TimeString = `${number}:${number}:${number}`;

export type DateTimeString = `${DateString} ${TimeString}`;


export type Comparable = number | DateString | TimeString | DateTimeString;


export type ComparisonRule<T extends Comparable> = { type: ComparisonOperator; to: T; };

export type BetweenRule<T extends Comparable> = { type: 'between'; low: T; high: T; };


export type NumberValueRule<T extends Comparable> = ComparisonRule<T> | BetweenRule<T>;

export type TextValueRule = { type: 'contains' | 'begins' | 'ends'; value: string; };


export type CustomRule = { type: 'custom'; expression: Expression; };


export type NumberRule = NumberValueRule<Comparable> | CustomRule;

export type TextRule = TextValueRule | NumberValueRule<number> | CustomRule;


export type ConditionalStyle<Rule> = { on: Rule[]; style: Style; };


/* Data Types */
export type TextType = {
    type: 'text';
    expression?: Expression;
    rules?: TextRule[];
    styles?: ConditionalStyle<TextRule[]>;
};

export type NumericType = {
    type: 'numeric';
    expression?: Expression;
    rules?: NumberRule[];
    format?: NumericFormat;
    styles?: ConditionalStyle<NumberRule[]>;
};

export type EnumItem = string | { value: string; style?: Style; };

export type EnumType = { type: 'enum'; values: EnumItem[]; };

export type LookupType = { type: 'lookup'; values: ColumnReference; };

export type DataType = Reference | TextType | NumericType | EnumType | LookupType;

/* Formats */
export type DigitPlaceholder = {
    fixed?: number; /** '0' in NumericFormat */
    flex?: number;  /** '#' in NumericFormat */
    align?: number; /** '?' in NumericFormat */
};

export type BaseNumberFormat<Type extends string> = {
    type: Type;
    integer: number | DigitPlaceholder;
    decimal: number | DigitPlaceholder;
    commas?: boolean; /** Separate thousands with ',' */
    negatives?: 'minus' | 'enclosed';
};

export type NumberFormat = BaseNumberFormat<'number'>;

export type PercentageFormat = BaseNumberFormat<'percent'>;

export type CurrencyFormat = BaseNumberFormat<'currency'> & {
    symbol: string;
    position?: 'prefix' | 'suffix';
};

export type DateFormatString =
    | 'YYYY-MM-DD'
    | 'MM/DD/YYYY'
    | 'DD/MM/YYYY'
    | 'MMM DD, YYYY'
    | 'DD MMM YYYY'
    | 'YYYY/MM/DD'
    | "dddd, MMMM D, YYYY"
    | "ddd, MMM D, YYYY";

export type TimeFormatString =
    | 'HH:mm'
    | 'h:mm AM/PM'
    | 'HH:mm:ss'
    | 'h:mm:ss AM/PM'
    | 'HH:mm:ss.S'
    | 'HH:mm:ss.SS'
    | 'HH:mm:ss.SSS';

export const DateFormats = Object.freeze({
    'ISODate': 'YYYY-MM-DD',
    'SlashedDate': 'MM/DD/YYYY',
    'EuropeanDate': 'DD/MM/YYYY',
    'LongDate': 'dddd, MMMM D, YYYY',
    'ShortLongDate': 'ddd, MMM D, YYYY',
    'MonthDayYear': 'MMM DD, YYYY',
    'DayMonthYear': 'DD MMM YYYY',
} as const) satisfies Record<string, DateFormatString>;

export const TimeFormats = Object.freeze({
    '24HourTime': 'HH:mm',
    '12HourTime': 'h:mm AM/PM',
    '24HourTimeWithSeconds': 'HH:mm:ss',
    '12HourTimeWithSeconds': 'h:mm:ss AM/PM',
    '24HourTimeWithTenths': 'HH:mm:ss.S',
    '24HourTimeWithHundredths': 'HH:mm:ss.SS',
    '24HourTimeWithMilliseconds': 'HH:mm:ss.SSS',
} as const) satisfies Record<string, TimeFormatString>;

export type TemporalFormat = {
    type: 'temporal';
    date?: DateFormatString;
    time?: TimeFormatString;
};

export type NumericFormat = NumberFormat | PercentageFormat | CurrencyFormat | TemporalFormat;

/* Expressions */
export type CompoundExpression = { type: 'compound'; with: Operator; left: Expression; right: Expression; };

export type NegateExpression = { type: 'negate'; on: Expression; };

export type FunctionExpression = { type: 'function'; name: string; args: Expression[]; };

export type LiteralExpression = { type: 'literal'; value: string | number | boolean; };

export type DataExpression = { type: 'data'; from: DataReference; };

export type SelfExpression = { type: 'self'; };

export type Expression =
    | CompoundExpression
    | NegateExpression
    | FunctionExpression
    | LiteralExpression
    | DataExpression
    | SelfExpression;

/* Table Structures */
export type TableUnit = {
    name: string;   // [A-Z_](A-Za-z0-9_)*    
    style?: StyleSet;
    description?: string;
};

export type TableColumn = TableUnit & {
    type: DataType;
    source?: string; // description of source of data
};

// Group of Columns
export type TableGroup = TableUnit & {
    columns: TableColumn[];
};

export type TableSheet = TableUnit & {
    groups: TableGroup[];
    rows: number;
};

export type Definitions = {
    colors: Record<string, Color>;
    styles: Record<string, Style>; // Standard Styles are automatically included but will be overwritten for references if you do
    borders: Record<string, Border>;
    types: Record<string, DataType>;
};

export type TableBook = TableUnit & {
    sheets: TableSheet[];
    definitions?: Definitions;
};
