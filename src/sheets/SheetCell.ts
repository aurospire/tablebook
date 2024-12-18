import { ColorObject } from "../tables/types";

export type SheetCell = { col: number; row: number, };

export type SheetRange = { start: SheetCell, end: SheetCell; };

export const SheetRange = Object.freeze({
    box: (col: number, row: number, width: number, height: number): SheetRange => ({ start: { col, row }, end: { col: col + width, row: row + height } }),
    col: (col: number, start: number, length: number): SheetRange => ({ start: { col, row: start }, end: { col: col + 1, row: start + length } }),
    row: (row: number, start: number, length: number): SheetRange => ({ start: { col: start, row }, end: { col: start + length, row: row + 1 } }),
});


export type SheetCellFormula = { formula: string; };

export type SheetCellValue = string | number | boolean | SheetCellFormula;


export type SheetCellAlignment = 'start' | 'middle' | 'end';

export type SheetCellWrap = 'overflow' | 'clip' | 'wrap';

export type SheetCellType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetCellFormat = {
    back?: ColorObject | null;
    fore?: ColorObject | null;

    bold?: boolean | null;
    italic?: boolean | null;

    horizontal?: SheetCellAlignment | null;
    vertical?: SheetCellAlignment | null;
    wrap?: SheetCellWrap | null;

    type?: SheetCellType | null;
    pattern?: string | null;
};

export const nullSheetCellFormat = { back: null, fore: null, bold: null, italic: null, horizontal: null, vertical: null, wrap: null, type: null, pattern: null };

export type SheetCellProperties = {
    value?: SheetCellValue | null;
    format?: SheetCellFormat | null;
};