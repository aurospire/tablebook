import { NumericFormat, TemporalFormat } from "../tables/types";
import { SheetType } from "./SheetKind";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";


export type SheetBehavior = {
    type?: SheetType;
    format?: NumericFormat | TemporalFormat;    
    validation?: SheetRule;
    conditionalFormats?: SheetConditionalFormat[];
};
