import { DateTime } from "luxon";
import { TableComparisonOperator, TableExpression, TableMatchOperator, TableRangeOperator } from "../tables/types";
import { SheetStyle } from "./SheetStyle";
import { SheetSelector } from "./SheetSelector";

// Common Targets
export type NumberTarget = 'number';
export type DateTarget = 'temporal';

// Generic Rule for Comparison
export type SheetComparisonRule<TTarget, TValue> = {
    type: TableComparisonOperator;
    target: TTarget;
    value: TValue;
};

// Generic Rule for Ranges
export type SheetRangeRule<TTarget, TValue> = {
    type: TableRangeOperator;
    target: TTarget;
    low: TValue;
    high: TValue;
};

// Specialized Rules
export type SheetNumberComparisonRule = SheetComparisonRule<NumberTarget, number>;
export type SheetNumberRangeRule = SheetRangeRule<NumberTarget, number>;

export type SheetDateComparisonRule = SheetComparisonRule<DateTarget, DateTime>;
export type SheetDateRangeRule = SheetRangeRule<DateTarget, DateTime>;

export type SheetMatchRule = {
    type: TableMatchOperator;
    value: string;
};

export type SheetEnumRule = {
    type: 'enum';
    values: string[];
};

export type SheetLookupRule = {
    type: 'lookup';
    values: SheetSelector;
};

export type SheetFormulaRule = {
    type: 'formula';
    expression: TableExpression<SheetSelector>;
};

// Consolidated SheetRule Type
export type SheetRule =
    | SheetNumberComparisonRule
    | SheetNumberRangeRule
    | SheetDateComparisonRule
    | SheetDateRangeRule
    | SheetMatchRule
    | SheetEnumRule
    | SheetLookupRule
    | SheetFormulaRule;

export type SheetConditionalStyle = {
    rule: SheetRule;
    apply: SheetStyle;
};
