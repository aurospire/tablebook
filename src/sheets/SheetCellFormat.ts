import { ColorObject, BorderType } from "../tables/types";

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

export type SheetCellAlign = 'start' | 'middle' | 'end';

export type SheetCellWrap = 'overflow' | 'clip' | 'wrap';

export type SheetCellType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetCellAlignment = {
    horizontal?: SheetCellAlign | null;
    vertical?: SheetCellAlign | null;
    wrap?: SheetCellWrap | null;
};

export type SheetCellFormat = {
    type?: SheetCellType | null;
    pattern?: string | null;
};

export const nullSheetCellProperties = { back: null, fore: null, bold: null, italic: null, horizontal: null, vertical: null, wrap: null, type: null, pattern: null };

export type SheetCellProperties = SheetStyle & SheetCellAlignment & SheetCellFormat;