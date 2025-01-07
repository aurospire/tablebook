import { Expression, NumericFormat, TemporalFormat } from "../tables/types";
import { ColorObject } from "../util/Color";
import { SheetType } from "./SheetKind";
import { SheetSelector } from "./SheetPosition";
import { SheetConditionalFormat, SheetRule } from "./SheetRule";
import { SheetTitleStyle, SheetStyle } from "./SheetStyle";

export type SheetBook = {
    title: string;
    pages: SheetPage[];
};

export type SheetPage = {
    title: string;
    tabColor?: ColorObject;
    groups: SheetGroup[];
};

export type SheetGroup = {
    title: string;
    titleStyle?: SheetTitleStyle;
    columns: SheetColumn[];
};

export type SheetColumn = {
    title: string;
    titleStyle?: SheetTitleStyle;

    dataStyle?: SheetStyle;
    type?: SheetType;
    format?: NumericFormat | TemporalFormat;
    validation?: SheetRule;
    formula?: Expression<SheetSelector>;
    conditionalFormats?: SheetConditionalFormat[];
};
