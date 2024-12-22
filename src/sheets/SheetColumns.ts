import { NumericFormat } from "../tables/types";
import { SheetBorder, SheetStyle } from "./SheetData";
import { SheetCellFormula } from "./SheetCellValue";
import { SheetCondition, SheetConditionalFormat } from "./SheetCondition";

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
    validation?: SheetCondition;
    formula?: SheetCellFormula;
    conditionalFormats?: SheetConditionalFormat[];
};
