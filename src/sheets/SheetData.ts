import { BorderType } from "../tables/types";
import { ColorObject } from "../util/Color";

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

export type SheetType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetFormula = (column: number, row: number) => string;

export type SheetValue = string | number | boolean | SheetFormula;

export type SheetContent = {
    value?: SheetValue | null;
};

export type SheetAlignment = {
    horizontal?: SheetAlign | null;
    vertical?: SheetAlign | null;
    wrap?: SheetWrap | null;
};

export type SheetFormat = {
    type?: SheetType | null;
    pattern?: string | null;
};

export const nullSheetData = {
    back: null, fore: null,
    bold: null, italic: null,
    horizontal: null, vertical: null, wrap: null,
    type: null, pattern: null
};

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetFormat;