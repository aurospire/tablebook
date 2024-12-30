import { DateTime } from "luxon";
import { ComparisonOperator, Expression, MatchOperator, RangeOperator } from "../tables/types";
import { SheetStyle } from './SheetData';
import { SheetPosition, SheetRange } from "./SheetPosition";

export type SheetComparisonValue = number | DateTime;

export type SheetComparisonTarget = 'numeric' | 'date';

export type SheetComparisonRule = {
    type: ComparisonOperator
    target: SheetComparisonTarget;
    value: SheetComparisonValue;
};

export type SheetRangeRule = {
    type: RangeOperator;
    target: SheetComparisonTarget;
    low: SheetComparisonValue;
    high: SheetComparisonValue;
};

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
    range: SheetRange | SheetPosition;
};

export type SheetFormulaRule = {
    type: 'formula';
    from: Expression<SheetRange>;
};

export type SheetRule =
    | SheetComparisonRule
    | SheetRangeRule
    | SheetMatchRule
    | SheetEnumRule
    | SheetLookupRule
    | SheetFormulaRule
    ;

export type SheetConditionalFormat = {
    rules: SheetRule;
    style: SheetStyle;
};
