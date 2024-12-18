export type Cell = { col: number; row: number, };

export type Range = { start: Cell, end: Cell; };

export const Range = Object.freeze({
    box: (start: Cell, end: Cell): Range => ({
        start: { col: Math.min(start.col, end.col), row: Math.min(start.row, end.row) },
        end: { col: Math.max(start.col, end.col), row: Math.max(start.row, end.row) }
    }),
    col: (col: number, start: number, length: number): Range => ({ start: { col, row: start }, end: { col: col + 1, row: start + length } }),
    row: (row: number, start: number, length: number): Range => ({ start: { col: start, row }, end: { col: start + length, row: row + 1 } }),
});
