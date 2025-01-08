import { NumericFormat, TemporalFormat, Expression } from "../tables/types";
import { SheetType } from "./SheetKind";
import { SheetSelector } from "./SheetPosition";
import { SheetRule, SheetConditionalFormat } from "./SheetRule";


export type SheetBehavior = {
    type?: SheetType;
    format?: NumericFormat | TemporalFormat;
    formula?: Expression<SheetSelector>;
    validation?: SheetRule;
    conditionalFormats?: SheetConditionalFormat[];
};
