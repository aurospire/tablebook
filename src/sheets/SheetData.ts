import { BorderType, Expression } from "../tables/types";
import { ColorObject } from "../util/Color";
import { SheetRange } from "./SheetPosition";

export type SheetSelector = number | `${number}`;

export type SheetExpression = Expression<SheetSelector>;

export type SheetValue = string | number | boolean | SheetExpression;

export type SheetContent = {
    value?: SheetValue | null;
};

export type SheetStyle = {
    fore?: ColorObject | null;
    back?: ColorObject | null;
    bold?: boolean | null;
    italic?: boolean | null;
};

export type SheetBorder = {
    type: BorderType;
    color: ColorObject;
};

export type SheetBorderSet = {
    top?: SheetBorder;
    bottom?: SheetBorder;
    left?: SheetBorder;
    right?: SheetBorder;
};


export type SheetAlign = 'start' | 'middle' | 'end';

export type SheetWrap = 'overflow' | 'clip' | 'wrap';


export type SheetAlignment = {
    horizontal?: SheetAlign | null;
    vertical?: SheetAlign | null;
    wrap?: SheetWrap | null;
};


export type SheetType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetFormat = {
    type?: SheetType | null;
    pattern?: string | null;
};

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetFormat;
