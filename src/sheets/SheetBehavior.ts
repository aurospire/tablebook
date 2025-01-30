import { TableNumericFormat, TableTemporalFormat } from "../tables/types";
import { SheetKind } from "./SheetType";
import { SheetConditionalStyle, SheetRule } from "./SheetRule";

export type SheetBehavior = {
    kind?: SheetKind;
    format?: TableNumericFormat | TableTemporalFormat;    
    rule?: SheetRule;
    styles?: SheetConditionalStyle[];
};
