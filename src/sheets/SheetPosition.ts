import { UnitPrefix, UnitSelector, UnitSelectorRegex } from "../tables/types";


export type SheetPosition<T = number> = { col: T; row: T; };

export const SheetPosition = <T>(col: T, row: T): SheetPosition<T> => ({ col, row });



export type SheetRange = { start: SheetPosition<number>, end?: Partial<SheetPosition<number>>; };

export const SheetRange = Object.freeze({
    cell: (col: number, row: number): SheetRange => ({
        start: { col, row }
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


// No .end just means cell, No .end.col means until the end of the row, No .end.row means until the end of the column
export type SheetSelector = { start: SheetPosition<UnitSelector>, end?: Partial<SheetPosition<UnitSelector>>; sheet?: string; };


const toUnitSelector = (value: number | UnitSelector, offset: number = 0, prefix?: UnitPrefix): UnitSelector => {
    const magnitude = typeof value === 'number' ? value : Number(value.slice(value[0] === '-' ? 0 : 1));

    prefix = prefix ?? typeof value === 'number' ? '$' : value[0] as UnitPrefix;

    return `${prefix}${magnitude + offset}`;
};

const charCodeA = 'A'.charCodeAt(0);

const letterfy = (value: number): string => {
    let result = '';

    do {
        result = String.fromCharCode(charCodeA + (value % 26 | 0)) + result;

        value = value / 26 | 0;
    } while (value);

    return result;
};

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

const toAddress = (position?: Partial<SheetPosition<UnitSelector>>, from?: SheetPosition): string => {
    const col = position?.col !== undefined ? modifyUnitSelector(position.col, from?.col ?? 0, true) : '';

    const row = position?.row !== undefined ? modifyUnitSelector(position.row, from?.row ?? 0, false) : '';

    return col + row;
};

export const SheetSelector = (sheet?: string) => Object.freeze({
    cell: (col: number | UnitSelector, row: number | UnitSelector): SheetSelector => ({
        sheet, start: SheetPosition(toUnitSelector(col), toUnitSelector(row)),
    }),

    row: (index: number | UnitSelector, offset: number = 0, width?: number): SheetSelector => {
        const startRow = toUnitSelector(index);
        const startCol = toUnitSelector(offset);

        return {
            sheet,
            start: SheetPosition(startCol, startRow),
            end: {
                col: width !== undefined ? toUnitSelector(offset, width, startCol[0] as UnitPrefix) : undefined,
                row: toUnitSelector(index, 1, startRow[0] as UnitPrefix),
            },
        };
    },


    column: (index: number | UnitSelector, offset: number = 0, height?: number): SheetSelector => {
        const startCol = toUnitSelector(index);
        const startRow = toUnitSelector(offset);

        return {
            sheet,
            start: SheetPosition(startCol, startRow),
            end: {
                col: toUnitSelector(index, 1, startCol[0] as UnitPrefix),
                row: height !== undefined ? toUnitSelector(offset, height, startRow[0] as UnitPrefix) : undefined,
            },
        };
    },

    region: (col: number | UnitSelector, row: number | UnitSelector, width?: number, height?: number): SheetSelector => {
        const startCol = toUnitSelector(col);
        const startRow = toUnitSelector(row);

        return {
            sheet,
            start: SheetPosition(startCol, startRow),
            end: {
                col: width !== undefined ? toUnitSelector(col, width, startCol[0] as UnitPrefix) : undefined,
                row: height !== undefined ? toUnitSelector(row, height, startRow[0] as UnitPrefix) : undefined,
            },
        };
    },

    toAddress(selector?: SheetSelector | null, from?: SheetPosition): string {
        let result = '';

        if (selector?.sheet)
            result += `'${selector.sheet}'!`;

        result += toAddress(selector?.start, from);

        const end = toAddress(selector?.end, from);

        if (end)
            result += `:${end}`;


        return result;
    }
});

