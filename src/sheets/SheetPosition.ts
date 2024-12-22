export type SheetPosition<T = number> = { col: T; row: T, };

export const SheetPosition = <T>(col: T, row: T): SheetPosition<T> => ({ col, row });

export type SheetRange<T = number> = { start: SheetPosition<T>, end?: Partial<SheetPosition<T>>; };

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


