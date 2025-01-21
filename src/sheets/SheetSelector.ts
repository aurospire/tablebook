import { TableUnitSelector, TableUnitPrefix, TableUnitSelectorRegex } from "../tables/types";
import { SheetPosition } from "./SheetPosition";

/**
 * Represents a selector for ranges or positions within a sheet.
 * @remarks
 * - If `.to` is missing, it represents a single cell.
 * - If `.to.col` is missing, the range extends to the end of the row.
 * - If `.to.row` is missing, the range extends to the end of the column.
 */
export type SheetSelector = {
    from: SheetPosition<TableUnitSelector>;
    to?: Partial<SheetPosition<TableUnitSelector>>;
    page?: string;
};

/**
 * Converts a value to a {@link TableUnitSelector} by applying an offset and optional prefix.
 * @param value - The numeric value or existing {@link TableUnitSelector} to convert.
 * @param offset - The offset to apply, always positive (default: `0`).
 * @param prefix - The prefix to use (`$`, `+`, or `-`) (optional).
 * @returns A {@link TableUnitSelector} string.
 */
export const modifyUnitSelector = (value: number | TableUnitSelector, offset: number = 0, prefix?: TableUnitPrefix): TableUnitSelector => {
    const magnitude = typeof value === 'number' ? value : Number(value.slice(value[0] === '$' ? 1 : 0));

    const result = magnitude + offset;

    prefix = prefix ?? (typeof value === 'number'
        ? '$'
        : value[0] === '-'
            ? (result > 0 ? '+' : '-')
            : value[0]
    ) as TableUnitPrefix;

    return `${prefix}${Math.abs(result)}`;
};

/**
 * Converts a numeric column index to an A1-style column letter.
 * @param value - The 0-based column index.
 * @returns The column letter as a string.
 */
export const letterfy = (value: number): string => {
    let result = '';

    const charCodeA = 'A'.charCodeAt(0);

    while (value >= 0) {
        const digit = String.fromCharCode(charCodeA + value % 26 | 0);

        result = digit + result;

        value = (value / 26 | 0) - 1;
    }

    return result;
};

/**
 * Encodes a {@link TableUnitSelector} value based on an offset, current value, and letter preference.
 * @param offset - The offset to apply (can be `undefined` or `null`).
 * @param current - The current numeric value.
 * @param letter - Whether to convert to column letters.
 * @returns The encoded value as a string.
 */
export const encodeUnitSelector = (offset: TableUnitSelector, current: number, letter: boolean): string => {
    let base = '';

    let [_, type, number] = offset?.match(TableUnitSelectorRegex) ?? [];

    let value = Number(number ?? 0);

    if (type === '$')
        base = '$';
    else if (type === '-')
        value = current - value;

    else
        value = current + value;

    if (value < 0)
        throw new Error('Offset from current value resulted in a negative index.');

    return base + (letter ? letterfy(value) : (value + 1).toString());
};

/**
 * Converts a {@link SheetPosition} to an A1-style address string.
 * @param position - The position to convert.
 * @param from - The base position for relative selectors (optional).
 * @returns The address string.
 */
export const toAddress = (position?: Partial<SheetPosition<TableUnitSelector>>, from?: SheetPosition): string => {
    const col = position?.col !== undefined ? encodeUnitSelector(position.col, from?.col ?? 0, true) : '';
    const row = position?.row !== undefined ? encodeUnitSelector(position.row, from?.row ?? 0, false) : '';
    return col + row;
};

/**
 * Utilities for creating {@link SheetSelector} objects for specific ranges or positions.
 * All indices are 0-based.
 * Numbers are translated into absolute Unit Selectors (ex: 0 -> '$0').
 * @param page - The optional page name for the selector.
 * @returns An object with methods to create:
 * - `cell`: A selector for a single cell.
 * - `row`: A selector for a row or part of a row.
 * - `column`: A selector for a column or part of a column.
 * - `region`: A selector for a rectangular region.
 * - `toAddress`: Converts a {@link SheetSelector} into an A1-style address string.
 */
export const SheetSelector = (page?: string) => Object.freeze({
    /**
     * Creates a selector for a single cell.
     * @param col - The column index or {@link TableUnitSelector}.
     * @param row - The row index or {@link TableUnitSelector}.
     * @returns A {@link SheetSelector} object targeting the specified cell.
     */
    cell: (col: number | TableUnitSelector, row: number | TableUnitSelector): SheetSelector => ({
        page, from: SheetPosition(modifyUnitSelector(col), modifyUnitSelector(row)),
    }),

    /**
     * Creates a selector for a row or part of a row.
     * @param index - The starting row index or {@link TableUnitSelector}.
     * @param offset - The starting column index (default: `0`).
     * @param width - The number of columns to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified row range.
     */
    row: (index: number | TableUnitSelector, offset: number | TableUnitSelector = 0, width?: number): SheetSelector => {
        const startRow = modifyUnitSelector(index);
        const startCol = modifyUnitSelector(offset);
        return {
            page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: width !== undefined ? modifyUnitSelector(offset, width - 1, startCol[0] as TableUnitPrefix) : undefined,
                row: modifyUnitSelector(index, 0, startRow[0] as TableUnitPrefix),
            },
        };
    },

    /**
     * Creates a selector for a column or part of a column.
     * @param index - The starting column index or {@link TableUnitSelector}.
     * @param offset - The starting row index (default: `0`).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified column range.
     */
    column: (index: number | TableUnitSelector, offset: number | TableUnitSelector = 0, height?: number): SheetSelector => {
        const startCol = modifyUnitSelector(index);
        const startRow = modifyUnitSelector(offset);
        return {
            page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: modifyUnitSelector(index, 0, startCol[0] as TableUnitPrefix),
                row: height !== undefined ? modifyUnitSelector(offset, height - 1, startRow[0] as TableUnitPrefix) : undefined,
            },
        };
    },

    /**
     * Creates a selector for a rectangular region.
     * @param col - The starting column index or {@link TableUnitSelector}.
     * @param row - The starting row index or {@link TableUnitSelector}.
     * @param width - The number of columns to include (optional).
     * @param height - The number of rows to include (optional).
     * @returns A {@link SheetSelector} object targeting the specified region.
     */
    region: (col: number | TableUnitSelector, row: number | TableUnitSelector, width?: number, height?: number): SheetSelector => {
        const startCol = modifyUnitSelector(col);
        const startRow = modifyUnitSelector(row);
        return {
            page: page,
            from: SheetPosition(startCol, startRow),
            to: {
                col: width !== undefined ? modifyUnitSelector(col, width - 1, startCol[0] as TableUnitPrefix) : undefined,
                row: height !== undefined ? modifyUnitSelector(row, height - 1, startRow[0] as TableUnitPrefix) : undefined,
            },
        };
    },

    /**
     * Creates a selector for a custom range.
     * @param col - The starting column index or {@link TableUnitSelector}.
     * @param row - The starting row index or {@link TableUnitSelector}.
     * @param toCol - The ending column index or {@link TableUnitSelector} (optional).
     * @param toRow - The ending row index or {@link TableUnitSelector} (optional).
     * @returns A {@link SheetSelector} object targeting the specified range.
     */
    make: (col: number | TableUnitSelector, row: number | TableUnitSelector, toCol?: number | TableUnitSelector, toRow?: number | TableUnitSelector): SheetSelector => {
        return {
            page: page,
            from: { col: modifyUnitSelector(col), row: modifyUnitSelector(row) },
            to: toCol || toRow ? { col: toCol ? modifyUnitSelector(toCol) : undefined, row: toRow ? modifyUnitSelector(toRow) : undefined } : undefined
        };
    },

    /**
     * Converts a {@link SheetSelector} object into an A1-style address string.
     * @param selector - The selector to convert.
     * @param from - The base position for relative selectors (optional), defaults to a (0, 0) position.
     * @returns The A1-style address string representing the range or position.
     */
    toAddress(selector: SheetSelector, from?: SheetPosition): string {
        let result = '';

        const selectedPage = selector.page ?? page;

        if (selectedPage)
            result += `'${selectedPage}'!`;

        result += toAddress(selector.from, from);

        const to = toAddress(selector?.to, from);

        if (to)
            result += `:${to}`;

        return result;
    }
});
