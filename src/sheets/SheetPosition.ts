import { UnitPrefix, UnitSelector, UnitSelectorRegex } from "../tables/types";

/**
 * Represents a position within a sheet, defined by column and row indices.
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

/**
 * Represents a range of cells in a sheet, defined by start (`from`) and optional end (`to`) positions.
 * @remarks
 * - `from` and `to` are inclusive.
 * - If `to` is omitted, the range is treated as a cell.
 */
export type SheetRange = { from: SheetPosition<number>, to?: Partial<SheetPosition<number>>; };

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
        to: { col: width !== undefined ? offset + width : undefined, row: index }
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
        to: { col: index, row: height !== undefined ? offset + height : undefined }
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

/**
 * Represents a selector for ranges or positions within a sheet.
 * @remarks
 * - If `.to` is missing, it represents a single cell.
 * - If `.to.col` is missing, the range extends to the end of the row.
 * - If `.to.row` is missing, the range extends to the end of the column.
 */
export type SheetSelector = {
    from: SheetPosition<UnitSelector>;
    to?: Partial<SheetPosition<UnitSelector>>;
    page?: string;
};

/**
 * Converts a value to a {@link UnitSelector} by applying an offset and optional prefix.
 * @param value - The numeric value or existing {@link UnitSelector} to convert.
 * @param offset - The offset to apply (default: `0`).
 * @param prefix - The prefix to use (`$`, `+`, or `-`) (optional).
 * @returns A {@link UnitSelector} string.
 */
const toUnitSelector = (value: number | UnitSelector, offset: number = 0, prefix?: UnitPrefix): UnitSelector => {
    const magnitude = typeof value === 'number' ? value : Number(value.slice(value[0] === '-' ? 0 : 1));

    prefix = prefix ?? (typeof value === 'number' ? '$' : value[0] as UnitPrefix);

    return `${prefix}${magnitude + offset}`;
};

const charCodeA = 'A'.charCodeAt(0);

/**
 * Converts a numeric column index to an Excel-style column letter.
 * @param value - The column index.
 * @returns The column letter as a string.
 */
const letterfy = (value: number): string => {
    let result = '';

    do {
        result = String.fromCharCode(charCodeA + (value % 26 | 0)) + result;

        value = value / 26 | 0;
    } while (value);

    return result;
};

/**
 * Modifies a {@link UnitSelector} value based on an offset, current value, and letter preference.
 * @param offset - The offset to apply (can be `undefined` or `null`).
 * @param current - The current numeric value.
 * @param letter - Whether to convert to column letters.
 * @returns The modified value as a string.
 */
const modifyUnitSelector = (offset: UnitSelector | undefined | null, current: number, letter: boolean): string => {
    let base = '';

    let [_, type, number] = offset?.match(UnitSelectorRegex) ?? [];

    let value = Number(number ?? 0);

    if (type === '$')
        base = '$';
    else if (type === '-')
        value = current - value;
    else
        value = current + value;

    return base + (letter ? letterfy(value) : (value + 1).toString());
};

/**
 * Converts a {@link SheetPosition} to an Excel-style address string.
 * @param position - The position to convert.
 * @param from - The base position for relative selectors (optional).
 * @returns The address string.
 */
const toAddress = (position?: Partial<SheetPosition<UnitSelector>>, from?: SheetPosition): string => {
    const col = position?.col !== undefined ? modifyUnitSelector(position.col, from?.col ?? 0, true) : '';
    const row = position?.row !== undefined ? modifyUnitSelector(position.row, from?.row ?? 0, false) : '';
    return col + row;
};

/**
 * Utilities for creating {@link SheetSelector} objects for specific ranges or positions.
 * @param page - The optional page name for the selector.
 * @returns An object with methods to create:
 * - `cell`: A selector for a single cell.
 * - `row`: A selector for a row or part of a row.
 * - `column`: A selector for a column or part of a column.
 * - `region`: A selector for a rectangular region.
 * - `toAddress`: Converts a {@link SheetSelector} into an Excel-style address string.
 */
export const SheetSelector = (page?: string) => Object.freeze({
    /**
     * Creates a selector for a single cell.
     * @param col - The column index or {@link UnitSelector}.
     * @param row - The row index or {@link UnitSelector}.
     * @returns A {@link SheetSelector} object targeting the specified cell.
     */
    cell: (col: number | UnitSelector, row: number | UnitSelector): SheetSelector => ({
        page, from: SheetPosition(toUnitSelector(col), toUnitSelector(row)),
    }),

    /**
     * Creates a selector for a row or part of a row.
     * @param index - The starting row index or {@link UnitSelector}.
     * @param offset - The starting column index (default: `0`).
     * @param width - The number of columns to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified row range.
     */
    row: (index: number | UnitSelector, offset: number = 0, width?: number): SheetSelector => {
        const startRow = toUnitSelector(index);
        const startCol = toUnitSelector(offset);
        return {
            page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: width !== undefined ? toUnitSelector(offset, width - 1, startCol[0] as UnitPrefix) : undefined,
                row: toUnitSelector(index, 0, startRow[0] as UnitPrefix),
            },
        };
    },

    /**
     * Creates a selector for a column or part of a column.
     * @param index - The starting column index or {@link UnitSelector}.
     * @param offset - The starting row index (default: `0`).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified column range.
     */
    column: (index: number | UnitSelector, offset: number = 0, height?: number): SheetSelector => {
        const startCol = toUnitSelector(index);
        const startRow = toUnitSelector(offset);
        return {
            page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: toUnitSelector(index, 0, startCol[0] as UnitPrefix),
                row: height !== undefined ? toUnitSelector(offset, height - 1, startRow[0] as UnitPrefix) : undefined,
            },
        };
    },

    /**
     * Creates a selector for a rectangular region.
     * @param col - The starting column index or {@link UnitSelector}.
     * @param row - The starting row index or {@link UnitSelector}.
     * @param width - The number of columns to include (optional).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified region.
     */
    region: (col: number | UnitSelector, row: number | UnitSelector, width?: number, height?: number): SheetSelector => {
        const startCol = toUnitSelector(col);
        const startRow = toUnitSelector(row);
        return {
            page: page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: width !== undefined ? toUnitSelector(col, width - 1, startCol[0] as UnitPrefix) : undefined,
                row: height !== undefined ? toUnitSelector(row, height - 1, startRow[0] as UnitPrefix) : undefined,
            },
        };
    },

    /**
     * Converts a {@link SheetSelector} object into an Excel-style address string.
     * @param selector - The selector to convert (optional).
     * @param from - The base position for relative selectors (optional).
     * @returns The Excel-style address string representing the range or position.
     */
    toAddress(selector?: SheetSelector, from?: SheetPosition): string {
        let result = '';

        if (selector?.page)
            result += `'${selector.page}'!`;

        result += toAddress(selector?.from, from);

        const to = toAddress(selector?.to, from);

        if (to)
            result += `:${to}`;

        return result;
    }
});
