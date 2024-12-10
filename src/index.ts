/* Core Primitives */
type Self = 'self';

type Reference = `@${string}`;

type Color = `#${string}`;

type TextForm = boolean | { bold?: boolean; italic?: boolean; };

type BorderType = 'solid' | 'dotted' | 'dashed';

/* Selection */
type ColumnRef = { table?: string; group?: string; column: string; } | Self;

type PositionRowRef = { type: 'index' | 'offset'; value: number; };

type RangeRowRef = { type: 'range'; start: RowRef; end: RowRef; };

type RowRef = PositionRowRef | RangeRowRef | Self;

type DataSelection = { col: ColumnRef; row: RowRef; } | Self;

/* Styling */
type Inheritor = { inherit?: Reference; };

type Style = Inheritor & {
    fore?: Color | Reference;
    back?: Color | Reference;
    form?: TextForm;
};

type Border = Inheritor & {
    color?: Color | Reference;
    width?: number;
    type?: BorderType;
};

type BorderSet = Inheritor & {
    below?: Border | Reference;
    between?: Border | Reference;
};

type HeaderStyle = Style & { border?: BorderSet; };

type FixedStyleSet =
    | 'redberry'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'cyan'
    | 'cornflowerblue'
    | 'blue'
    | 'purple'
    | 'magenta'
    | 'grayscale';

type StyleSet = FixedStyleSet | (Inheritor & {
    group?: HeaderStyle | Reference;
    header?: HeaderStyle | Reference;
    data?: Style | Reference;
});

/* Data Validation and Rules */
// Rule[] => All(Rule) all must pass

type DateString = `${number}-${number}-${number}`;

type TimeString = `${number}:${number}:${number}`;

type DateTimeString = `${DateString} ${TimeString}`;


type Comparable = number | DateString | TimeString | DateTimeString;


type ComparisonRule<T extends Comparable> = { type: '>=' | '<=' | '>' | '<' | '=' | '<>'; to: T; };

type BetweenRule<T extends Comparable> = { type: 'between'; low: T; high: T; };


type NumberValueRule<T extends Comparable> = ComparisonRule<T> | BetweenRule<T>;

type TextValueRule = { type: 'contains' | 'begins' | 'ends'; value: string; };


type CustomRule = { type: 'custom'; expression: Expression; };


type NumberRule = NumberValueRule<Comparable> | CustomRule;

type TextRule = TextValueRule | NumberValueRule<number> | CustomRule;


type ConditionalStyle<Rule> = { on: Rule[]; style: Style; };


/* Data Types */
type TextType = {
    type: 'text';
    expression?: Expression;
    rules?: TextRule[];
    styles?: ConditionalStyle<TextRule[]>;
};

type NumericType = {
    type: 'numeric';
    expression?: Expression;
    rules?: NumberRule[];
    format?: NumericFormat;
    styles?: ConditionalStyle<NumberRule[]>;
};

type EnumItem = string | { value: string; style?: Style; };

type EnumType = { type: 'enum'; values: EnumItem[]; };


type LookupType = { type: 'lookup'; values: ColumnRef; };

type DataType = Reference | TextType | NumericType | EnumType | LookupType;

/* Formats */
type DigitPlaceholder = {
    fixed?: number; /** '0' in NumericFormat */
    flex?: number;  /** '#' in NumericFormat */
    align?: number; /** '?' in NumericFormat */
};

type BaseNumberFormat<Type extends string> = {
    type: Type;
    integer: number | DigitPlaceholder;
    decimal: number | DigitPlaceholder;
    commas?: boolean; /** Separate thousands with ',' */
    negatives?: 'minus' | 'enclosed';
};

type NumberFormat = BaseNumberFormat<'number'>;

type PercentageFormat = BaseNumberFormat<'percent'>;

type CurrencyFormat = BaseNumberFormat<'currency'> & {
    symbol: string;
    position?: 'prefix' | 'suffix';
};

type DateFormatString =
    | 'YYYY-MM-DD'
    | 'MM/DD/YYYY'
    | 'DD/MM/YYYY'
    | 'MMM DD, YYYY'
    | 'DD MMM YYYY'
    | 'YYYY/MM/DD'
    | "dddd, MMMM D, YYYY"
    | "ddd, MMM D, YYYY";

type TimeFormatString =
    | 'HH:mm'
    | 'h:mm AM/PM'
    | 'HH:mm:ss'
    | 'h:mm:ss AM/PM'
    | 'HH:mm:ss.S'
    | 'HH:mm:ss.SS'
    | 'HH:mm:ss.SSS';

const DateFormats = Object.freeze({
    'ISODate': 'YYYY-MM-DD',
    'SlashedDate': 'MM/DD/YYYY',
    'EuropeanDate': 'DD/MM/YYYY',
    'LongDate': 'dddd, MMMM D, YYYY',
    'ShortLongDate': 'ddd, MMM D, YYYY',
    'MonthDayYear': 'MMM DD, YYYY',
    'DayMonthYear': 'DD MMM YYYY',
}) satisfies Record<string, DateFormatString>;

const TimeFormats = Object.freeze({
    '24HourTime': 'HH:mm',
    '12HourTime': 'h:mm AM/PM',
    '24HourTimeWithSeconds': 'HH:mm:ss',
    '12HourTimeWithSeconds': 'h:mm:ss AM/PM',
    '24HourTimeWithTenths': 'HH:mm:ss.S',
    '24HourTimeWithHundredths': 'HH:mm:ss.SS',
    '24HourTimeWithMilliseconds': 'HH:mm:ss.SSS',
}) satisfies Record<string, TimeFormatString>;

type TemporalFormat = {
    type: 'temporal';
    date?: DateFormatString;
    time?: TimeFormatString;
};

type NumericFormat = NumberFormat | PercentageFormat | CurrencyFormat | TemporalFormat;

/* Expressions */
type BinaryOperator = '+' | '-' | '*' | '/' | '^' | '=' | '>' | '<' | '>=' | '<=' | '<>' | '&';

type OperationExpression = { type: 'operation'; operator: BinaryOperator; left: Expression; right: Expression; };

type NegateExpression = { type: 'negate'; expression: Expression; };

type FunctionExpression = { type: 'function'; name: string; args: Expression[]; };

type LiteralExpression = { type: 'literal'; value: string | number | boolean; };

type DataSelectionExpression = { type: 'selection'; selection: DataSelection; };

type SelfExpression = { type: 'self'; };

type Expression =
    | OperationExpression
    | NegateExpression
    | FunctionExpression
    | LiteralExpression
    | SelfExpression;

/* Table Structures */
type TableUnit = { name: string; style?: StyleSet; description?: string; };

type TableColumn = TableUnit & { type: DataType; source?: string; };

type TableGroup = TableUnit & { columns: TableColumn[]; };

type TableSheet = TableUnit & { groups: TableGroup[]; rows: number; };

type Definitions = {
    colors: Record<string, Color>;
    styles: Record<string, Style>;
    borders: Record<string, Border>;
    types: Record<string, DataType>;
};

type TableBook = TableUnit & { defs?: Definitions; sheets: TableSheet[]; };
