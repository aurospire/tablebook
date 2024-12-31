import { DateTime } from "luxon";
import { BorderType, ComparisonOperator, MatchOperator, RangeOperator } from "../../tables/types";
import { SheetAlign, SheetData, SheetWrap } from "../SheetData";
import { SheetType } from "../SheetKind";
import { SheetRule } from "../SheetRule";
import { GoogleCondition } from "./GoogleTypes";
import { SheetPosition } from "../SheetPosition";

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


const GoogleOneOfListConditionType = 'ONE_OF_LIST';
const GoogleOneOfRangeConditionType = 'ONE_OF_RANGE';

const GoogleFormulaConditionType = 'CUSTOM_FORMULA';

const makeGoogleCondition = (type: string, values: string[]): GoogleCondition => {
    return { type, values: values.map(value => ({ userEnteredValue: value })) };
};

const toISODate = (date: DateTime): string => date.toISODate()!;

// YYYY-MM-DDTHH:MM:SS (NO TIMEZONE)
const toISODateTime = (date: DateTime): string => date.toString();

const toGoogleCondition = (rule: SheetRule, postion: SheetPosition): GoogleCondition => {
    switch (rule.type) {
        case "=":
        case ">":
        case "<":
        case ">=":
        case "<=":
        case "<>":
            switch (rule.target) {
                case "number":
                    return makeGoogleCondition(GoogleNumberConditionTypeMap[rule.type], [rule.value.toString()]);
                case "date":
                    return makeGoogleCondition(GoogleDateConditionTypeMap[rule.type], [toISODate(rule.value)]);
                case "datetime":
                    return makeGoogleCondition(GoogleDateConditionTypeMap[rule.type], [toISODateTime(rule.value)]);
            }
        case "between":
        case "outside":
            switch (rule.target) {
                case "number":
                    return makeGoogleCondition(GoogleNumberConditionTypeMap[rule.type], [rule.low.toString(), rule.high.toString()]);
                case "date":
                    return makeGoogleCondition(GoogleDateConditionTypeMap[rule.type], [toISODate(rule.low), toISODate(rule.high)]);
                case "datetime":
                    return makeGoogleCondition(GoogleDateConditionTypeMap[rule.type], [toISODateTime(rule.low), toISODateTime(rule.high)]);
            }

        case "contains":
        case "begins":
        case "ends":
            return makeGoogleCondition(GoogleTextConditionTypeMap[rule.type], [rule.value]);

        case "enum":
            return makeGoogleCondition(GoogleOneOfListConditionType, rule.values);

        case "lookup":

            //return makeGoogleCondition(GoogleOneOfRangeConditionType);

        case "formula":
    }

    throw new Error(`Unsupported Rule Type: ${rule}`);
};