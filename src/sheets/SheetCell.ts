import { ColorObject } from "../tables/types";

export type SheetAddress = { col: number; row: number, };

export type SheetRange = { start: SheetAddress, end?: Partial<SheetAddress>; };

export const SheetRange = Object.freeze({
    cell: (col: number, row: number): SheetRange => ({
        start: { col, row },
        end: { col: col + 1, row: row + 1 }
    }),

    row: (index: number, offset: number = 0, width?: number): SheetRange => ({
        start: { col: offset, row: index },
        end: { col: width !== undefined ? offset + width : undefined, row: index + 1 }
    }),

    column: (index: number, offset: number = 0, height?: number): SheetRange => ({
        start: { col: index, row: offset },
        end: { col: index + 1, row: height !== undefined ? offset + height : undefined }
    }),

    region: (col: number, row: number, width?: number, height?: number): SheetRange => ({
        start: { col, row },
        end: {
            col: width !== undefined ? col + width : undefined,
            row: height !== undefined ? row + height : undefined
        }
    })
});


export type SheetCellFormula = (column: number, row: number) => string;

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