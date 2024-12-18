export type SheetCell = { col: number; row: number, };

export type SheetRange = { start: SheetCell, end: SheetCell; };

export const SheetRange = Object.freeze({
    box: (col: number, row: number, width: number, height: number): SheetRange => ({ start: { col, row }, end: { col: col + width, row: row + height } }),
    col: (col: number, start: number, length: number): SheetRange => ({ start: { col, row: start }, end: { col: col + 1, row: start + length } }),
    row: (row: number, start: number, length: number): SheetRange => ({ start: { col: start, row }, end: { col: start + length, row: row + 1 } }),
});
