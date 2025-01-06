import { Expression, NumericFormat } from "../tables/types";
import { SheetBorder, SheetStyle } from "./SheetStyle";
import { SheetSelector } from "./SheetPosition";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";

export type SheetHeaderPartitions = {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

export type SheetHeaderStyle = SheetStyle & SheetHeaderPartitions;

export type SheetColumnConfig = {
    headerStyle?: SheetHeaderStyle;
    dataStyle?: SheetStyle;
    format?: NumericFormat;
    validation?: SheetRule;
    formula?: Expression<SheetSelector>;
    conditionalFormats?: SheetConditionalFormat[];
};
