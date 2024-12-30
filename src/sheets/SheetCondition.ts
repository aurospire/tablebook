import { ComparisonOperator, Expression, MatchOperators, RangeOperator } from "../tables/types";
import { SheetStyle } from './SheetData';
import { SheetPosition, SheetRange } from "./SheetPosition";

export type SheetComparisonValue = number | string;

export type SheetComparisonTarget = 'numeric' | 'length';

export type SheetComparisonCondition = {
    type: ComparisonOperator
    target: SheetComparisonTarget;
    value: SheetComparisonValue;
};

export type SheetBetweenCondition = {
    type: RangeOperator;
    target: SheetComparisonTarget;
    low: SheetComparisonValue;
    high: SheetComparisonValue;
};

export type SheetMatchCondition = {
    typeof: (typeof MatchOperators)[number];
    value: string;
};

export type SheetEnumCondition = {
    type: 'enum';
    values: string[];
};

export type SheetLookupCondition = {
    type: 'lookup';
    sheet: string;
    range: SheetRange | SheetPosition;
};

export type SheetFormulaCondition = {
    type: 'formula';
    from: Expression<SheetRange>;
};

export type SheetCondition =
    | SheetComparisonCondition
    | SheetBetweenCondition
    | SheetMatchCondition
    | SheetEnumCondition
    | SheetLookupCondition
    | SheetFormulaCondition
    ;

export type SheetConditionalFormat = {
    condition: SheetCondition;
    style: SheetStyle;
};
