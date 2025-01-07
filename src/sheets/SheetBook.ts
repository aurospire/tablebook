import { Expression, NumericFormat } from "../tables/types";
import { ColorObject } from "../util/Color";
import { SheetSelector } from "./SheetPosition";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";
import { SheetHeaderStyle, SheetStyle } from "./SheetStyle";

export type SheetBook = {
    title: string;
    pages: SheetPage[];
};

export type SheetPage = {
    title: string;
    color: ColorObject;
    groups: SheetGroup[];
};

export type SheetGroup = {
    title: string;
    titleStyle?: SheetHeaderStyle;
    columns: SheetColumn[];
};

export type SheetColumn = {
    title: string;
    titleStyle?: SheetHeaderStyle;

    dataStyle?: SheetStyle;
    format?: NumericFormat;
    validation?: SheetRule;
    formula?: Expression<SheetSelector>;
    conditionalFormats?: SheetConditionalFormat[];
};
