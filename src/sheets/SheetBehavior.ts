import { NumericFormat, TemporalFormat } from "../tables/types";
import { SheetKind } from "./SheetKind";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";


export type SheetBehavior = {
    kind?: SheetKind;
    format?: NumericFormat | TemporalFormat;    
    validation?: SheetRule;
    conditionalFormats?: SheetConditionalFormat[];
};
