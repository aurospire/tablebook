import { TableNumericFormat, TableTemporalFormat } from "../tables/types";
import { SheetKind } from "./SheetType";
import { SheetConditionalStyle, SheetRule } from "./SheetRule";

export type SheetBehavior = {
    kind?: SheetKind;
    styles?: SheetConditionalStyle[];
    rule?: SheetRule;
    format?: TableNumericFormat | TableTemporalFormat;    
};
