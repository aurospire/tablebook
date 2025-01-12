import { DateTime } from "luxon";
import { toFormula } from "../sheets/SheetExpression";
import { SheetPosition, SheetSelector } from "../sheets/SheetPosition";
import { SheetRule } from "../sheets/SheetRule";
import { ComparisonOperator, MatchOperator, RangeOperator } from "../tables/types";
import { GoogleCondition } from "./GoogleTypes";

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
    'is': 'TEXT_EQ',
    'contains': 'TEXT_CONTAINS',
    'begins': 'TEXT_STARTS_WITH',
    'ends': 'TEXT_ENDS_WITH',
} satisfies Record<MatchOperator, string>;


export const GoogleOneOfListConditionType = 'ONE_OF_LIST';
export const GoogleOneOfRangeConditionType = 'ONE_OF_RANGE';

export const GoogleFormulaConditionType = 'CUSTOM_FORMULA';


const makeGoogleCondition = (type: string, values: string[]): GoogleCondition => {
    return { type, values: values.map(value => ({ userEnteredValue: value })) };
};

const toISODate = (date: DateTime): string => date.toISODate()!;
// YYYY-MM-DDTHH:MM:SS (NO TIMEZONE)

const toISODateTime = (date: DateTime): string => date.toString();

export const toGoogleCondition = (rule: SheetRule, postion: SheetPosition, validation: boolean): GoogleCondition => {
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

        case "is":
        case "contains":
            return makeGoogleCondition(GoogleTextConditionTypeMap[rule.type], [rule.value]);
        case "begins":
        case "ends":
            if (validation)
                throw new Error("Not implemented yet"); // LEFT(POS, LEN(VALUE))=VALUE or RIGHT(POS, LEN(VALUE))=VALUE
            else
                return makeGoogleCondition(GoogleTextConditionTypeMap[rule.type], [rule.value]);

        case "enum":
            return makeGoogleCondition(GoogleOneOfListConditionType, rule.values);

        case "lookup":
            // REQUIRES '=' so its not interpreted as string but rather formula (thanks gemini!)
            return makeGoogleCondition(GoogleOneOfRangeConditionType, ['=' + SheetSelector(rule.values.page).toAddress(rule.values, postion)]);

        case "formula":
            return makeGoogleCondition(GoogleFormulaConditionType, [toFormula(rule.expression, postion)]);
    }
};
