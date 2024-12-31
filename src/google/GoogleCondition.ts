import { DateTime } from "luxon";
import { toFormula } from "../sheets/SheetExpression";
import { SheetPosition, SheetSelector } from "../sheets/SheetPosition";
import { SheetRule } from "../sheets/SheetRule";
import { GoogleDateConditionTypeMap, GoogleFormulaConditionType, GoogleNumberConditionTypeMap, GoogleOneOfListConditionType, GoogleOneOfRangeConditionType, GoogleTextConditionTypeMap } from "./GoogleMaps";
import { GoogleCondition } from "./GoogleTypes";

const makeGoogleCondition = (type: string, values: string[]): GoogleCondition => {
    return { type, values: values.map(value => ({ userEnteredValue: value })) };
};

const toISODate = (date: DateTime): string => date.toISODate()!;
// YYYY-MM-DDTHH:MM:SS (NO TIMEZONE)

const toISODateTime = (date: DateTime): string => date.toString();

export const toGoogleCondition = (rule: SheetRule, postion: SheetPosition): GoogleCondition => {
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
            return makeGoogleCondition(GoogleOneOfRangeConditionType, [SheetSelector(rule.sheet).toAddress(rule.range, postion)]);

        case "formula":
            return makeGoogleCondition(GoogleFormulaConditionType, [toFormula(rule.from, postion)]);
    }
};
