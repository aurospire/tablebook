import { Expression } from "../tables/types";
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

export type SheetColumn = {
    title: string;
    titleStyle?: SheetTitleStyle;
    dataStyle?: SheetStyle;
    formula?: Expression<SheetSelector>;
    behavior?: SheetBehavior;
};
