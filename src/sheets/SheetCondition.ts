import { ComparisonOperators, BetweenOperator, MatchOperators } from "../tables/types";
import { SheetPosition , SheetRange } from "./SheetPosition";
import { SheetCellFormula } from './SheetCellValue';
import { SheetStyle } from './SheetData';

export type SheetComparisonValue = number | string;

export type SheetComparisonTarget = 'numeric' | 'length';

export type SheetComparisonCondition = {
    type: (typeof ComparisonOperators)[number];
    target: SheetComparisonTarget;
    value: SheetComparisonValue;
};

export type SheetBetweenCondition = {
    type: typeof BetweenOperator;
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
    range: SheetRange | SheetPosition ;
};

export type SheetFormulaCondition = {
    type: 'formula';
    from: SheetCellFormula;
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
