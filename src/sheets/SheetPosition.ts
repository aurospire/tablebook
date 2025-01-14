/**
 * Represents a position within a sheet, defined by column and row indices.
 * All Positions and Selectors are 0-based.
 * @template T - The type of the column and row values (default: `number`).
 */
export type SheetPosition<T = number> = { col: T; row: T; };

/**
 * Creates a {@link SheetPosition} object.
 * @template T - The type of the column and row values.
 * @param col - The column index or value.
 * @param row - The row index or value.
 * @returns A {@link SheetPosition} object.
 */
export const SheetPosition = <T>(col: T, row: T): SheetPosition<T> => ({ col, row });
