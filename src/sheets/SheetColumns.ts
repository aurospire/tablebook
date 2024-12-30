import { Expression, NumericFormat } from "../tables/types";
import { SheetBorder, SheetStyle } from "./SheetData";
import { SheetRule, SheetConditionalFormat } from "./SheetRule";
import { SheetRange } from "./SheetPosition";

export type SheetHeaderPartitions = {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

export type SheetHeaderStyle = {
    style: SheetStyle;
    borders?: SheetHeaderPartitions;
};

export type SheetColumnConfig = {
    header: SheetHeaderStyle;
    data: SheetDataConfig;
};

export type SheetDataConfig = {
    style: SheetStyle;
    format?: NumericFormat;
    validation?: SheetRule;
    formula?: Expression<SheetRange>;
    conditionalFormats?: SheetConditionalFormat[];
};
