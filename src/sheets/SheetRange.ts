import { SheetPosition } from "./SheetPosition";

/* Sheet Range */
/**
 * Represents a range of cells in a sheet, defined by start (`from`) and optional end (`to`) positions.
 * @remarks
 * - `from` and `to` are inclusive.
 * - If `to` is omitted, the range is treated as a cell.
 */
export type SheetRange = { from: SheetPosition<number>; to?: Partial<SheetPosition<number>>; };

/**
 * Utilities for creating {@link SheetRange} objects for various cell, row, column, or region ranges.
 */
export const SheetRange = Object.freeze({
    /**
     * Creates a range that includes a single cell.
     * @param col - The column index of the cell.
     * @param row - The row index of the cell.
     * @returns A {@link SheetRange} object for the specified cell.
     */
    cell: (col: number, row: number): SheetRange => ({ from: { col, row } }),

    /**
     * Creates a range that includes a single row or part of a row.
     * @param index - The starting row index.
     * @param offset - The starting column index (default: `0`).
     * @param width - The number of columns to include (optional).
     * @returns A {@link SheetRange} object for the specified row range.
     */
    row: (index: number, offset: number = 0, width?: number): SheetRange => ({
        from: { col: offset, row: index },
        to: { col: width !== undefined ? offset + width - 1 : undefined, row: index }
    }),

    /**
     * Creates a range that includes a single column or part of a column.
     * @param index - The starting column index.
     * @param offset - The starting row index (default: `0`).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetRange} object for the specified column range.
     */
    column: (index: number, offset: number = 0, height?: number): SheetRange => ({
        from: { col: index, row: offset },
        to: { col: index, row: height !== undefined ? offset + height - 1 : undefined }
    }),

    /**
     * Creates a range that includes a rectangular region.
     * @param col - The starting column index.
     * @param row - The starting row index.
     * @param width - The number of columns to include (optional).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetRange} object for the specified region.
     */
    region: (col: number, row: number, width?: number, height?: number): SheetRange => ({
        from: { col, row },
        to: {
            col: width !== undefined ? col + width - 1 : undefined,
            row: height !== undefined ? row + height - 1 : undefined
        }
    })
});
