import { NumericFormat, TemporalFormat } from "../tables/types";
import { SheetKind } from "./SheetKind";
import { SheetConditionalStyle, SheetRule } from "./SheetRule";


export type SheetBehavior = {
    kind?: SheetKind;
    format?: NumericFormat | TemporalFormat;    
    rule?: SheetRule;
    styles?: SheetConditionalStyle[];
};
