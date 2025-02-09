import { TableExpression } from "../tables/types";
import { ColorObject } from "../util/Color";
import { SheetBehavior } from "./SheetBehavior";
import { SheetSelector } from "./SheetSelector";
import { SheetTitleStyle, SheetStyle } from "./SheetStyle";

export type SheetBook = {
    title: string;
    pages: SheetPage[];
};

export type SheetPage = {
    title: string;
    tabColor?: ColorObject;
    groups: SheetGroup[];
    rows: number;
};

export type SheetGroup = {
    title: string;
    titleStyle?: SheetTitleStyle;
    columns: SheetColumn[];
};

export type SheetValues = { items?: TableExpression<SheetSelector>[], rest?: TableExpression<SheetSelector>; };

export type SheetColumn = {
    title: string;
    titleStyle?: SheetTitleStyle;
    dataStyle?: SheetStyle;
    behavior?: SheetBehavior;
    values?: SheetValues;
};
