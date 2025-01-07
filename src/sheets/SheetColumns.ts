import { Expression, NumericFormat } from "../tables/types";
import { SheetBorder, SheetStyle } from "./SheetStyle";
import { SheetSelector } from "./SheetPosition";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";

export type SheetHeaderStyle = SheetStyle & {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

export type SheetColumnConfig = {
    headerStyle?: SheetHeaderStyle;
    dataStyle?: SheetStyle;
    format?: NumericFormat;
    validation?: SheetRule;
    formula?: Expression<SheetSelector>;
    conditionalFormats?: SheetConditionalFormat[];
};
