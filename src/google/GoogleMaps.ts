import { BorderType, ComparisonOperator, MatchOperator, RangeOperator } from "../tables/types";
import { SheetAlign, SheetData, SheetWrap } from "../sheets/SheetData";
import { SheetType } from "../sheets/SheetKind";

export const GoogleBorderMap = {
    none: 'NONE',
    thin: 'SOLID',
    medium: 'SOLID_MEDIUM',
    thick: 'SOLID_THICK',
    dotted: 'DOTTED',
    dashed: 'DASHED',
    double: 'DOUBLE',
} as const satisfies Record<BorderType, string>;

export const GoogleHorizontalAlignMap = {
    start: 'LEFT',
    middle: 'CENTER',
    end: 'RIGHT'
} satisfies Record<SheetAlign, string>;

export const GoogleVerticalAlignMap = {
    start: 'TOP',
    middle: 'MIDDLE',
    end: 'BOTTOM'
} satisfies Record<SheetAlign, string>;

export const GoogleWrapMap = {
    overflow: 'OVERFLOW_CELL',
    clip: 'CLIP',
    wrap: 'WRAP'
} satisfies Record<SheetWrap, string>;

export const GoogleCellTypeMap = {
    text: 'TEXT',
    number: 'NUMBER',
    percent: 'PERCENT',
    currency: 'CURRENCY',
    date: 'DATE',
    time: 'TIME',
    datetime: 'DATE_TIME',
} satisfies Record<SheetType, string>;

export const GoogleFieldMap: Record<string, string[]> = {
    back: ['userEnteredFormat.backgroundColorStyle'],
    fore: ['userEnteredFormat.textFormat.foregroundColorStyle'],
    bold: ['userEnteredFormat.textFormat.bold'],
    italic: ['userEnteredFormat.textFormat.italic'],
    horizontal: ['userEnteredFormat.horizontalAlignment'],
    vertical: ['userEnteredFormat.verticalAlignment'],
    wrap: ['userEnteredFormat.wrapStrategy'],
    type: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    format: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    value: ['userEnteredValue'],
} satisfies Record<keyof SheetData, string[]>;


export const GoogleNumberConditionTypeMap: Record<string, string> = {
    '=': 'NUMBER_EQ',
    '<>': 'NUMBER_NOT_EQ',
    '>': 'NUMBER_GREATER',
    '>=': 'NUMBER_GREATER_THAN_EQ',
    '<': 'NUMBER_LESS',
    '<=': 'NUMBER_LESS_THAN_EQ',
    'between': 'NUMBER_BETWEEN',
    'outside': 'NUMBER_NOT_BETWEEN',
} satisfies Record<ComparisonOperator | RangeOperator, string>;

export const GoogleDateConditionTypeMap: Record<string, string> = {
    '=': 'DATE_EQ',
    '<>': 'DATE_NOT_EQ',
    '>': 'DATE_GREATER',
    '>=': 'DATE_GREATER_THAN_EQ',
    '<': 'DATE_LESS',
    '<=': 'DATE_LESS_THAN_EQ',
    'between': 'DATE_BETWEEN',
    'outside': 'DATE_NOT_BETWEEN',
} satisfies Record<ComparisonOperator | RangeOperator, string>;

export const GoogleTextConditionTypeMap: Record<string, string> = {
    'contains': 'TEXT_CONTAINS',
    'begins': 'TEXT_STARTS_WITH',
    'ends': 'TEXT_ENDS_WITH',
} satisfies Record<MatchOperator, string>;


export const GoogleOneOfListConditionType = 'ONE_OF_LIST';
export const GoogleOneOfRangeConditionType = 'ONE_OF_RANGE';

export const GoogleFormulaConditionType = 'CUSTOM_FORMULA';

