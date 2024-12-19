import { NumericFormat } from "../tables/types";
import { SheetCellFormula } from "./SheetCell";
import { SheetCondition, SheetConditionalFormat } from "./SheetCondition";
import { SheetHeaderStyle, SheetStyle } from "./SheetStyle";

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
