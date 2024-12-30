import { DateTime } from "luxon";
import { ComparisonOperator, Expression, MatchOperator, RangeOperator } from "../tables/types";
import { SheetStyle } from './SheetData';
import { SheetRange } from "./SheetPosition";

// Common Targets
export type NumberTarget = 'number';
export type DateTarget = 'date' | 'datetime';

// Generic Rule for Comparison
export type SheetComparisonRule<TTarget, TValue> = {
    type: ComparisonOperator;
    target: TTarget;
    value: TValue;
};

// Generic Rule for Ranges
export type SheetRangeRule<TTarget, TValue> = {
    type: RangeOperator;
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
    type: MatchOperator;
    value: string;
};

export type SheetEnumRule = {
    type: 'enum';
    values: string[];
};

export type SheetLookupRule = {
    type: 'lookup';
    sheet: string;
    range: SheetRange;
};

export type SheetFormulaRule = {
    type: 'formula';
    from: Expression<SheetRange>;
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

export type SheetConditionalFormat = {
    rules: SheetRule;
    style: SheetStyle;
};
