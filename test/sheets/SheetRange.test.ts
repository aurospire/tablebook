import { SheetRange } from "@/sheets/SheetRange";

describe("SheetRange", () => {
    describe("cell", () => {
        it("should create a range for a single cell", () => {
            const range = SheetRange.cell(3, 5);
            expect(range).toEqual({
                from: { col: 3, row: 5 },
            });
        });
    });

    describe("row", () => {
        it("should create a range for a single row without a width", () => {
            const range = SheetRange.row(4);
            expect(range).toEqual({
                from: { col: 0, row: 4 },
                to: { col: undefined, row: 4 },
            });
        });

        it("should create a range for a partial row with an offset", () => {
            const range = SheetRange.row(4, 2);
            expect(range).toEqual({
                from: { col: 2, row: 4 },
                to: { col: undefined, row: 4 },
            });
        });

        it("should create a range for a row with a specified width", () => {
            const range = SheetRange.row(4, 2, 5);
            expect(range).toEqual({
                from: { col: 2, row: 4 },
                to: { col: 7, row: 4 },
            });
        });
    });

    describe("column", () => {
        it("should create a range for a single column without a height", () => {
            const range = SheetRange.column(3);
            expect(range).toEqual({
                from: { col: 3, row: 0 },
                to: { col: 3, row: undefined },
            });
        });

        it("should create a range for a partial column with an offset", () => {
            const range = SheetRange.column(3, 2);
            expect(range).toEqual({
                from: { col: 3, row: 2 },
                to: { col: 3, row: undefined },
            });
        });

        it("should create a range for a column with a specified height", () => {
            const range = SheetRange.column(3, 2, 4);
            expect(range).toEqual({
                from: { col: 3, row: 2 },
                to: { col: 3, row: 5 },
            });
        });
    });

    describe("region", () => {
        it("should create a range for a rectangular region without width or height", () => {
            const range = SheetRange.region(2, 3);
            expect(range).toEqual({
                from: { col: 2, row: 3 },
                to: { col: undefined, row: undefined },
            });
        });

        it("should create a range for a rectangular region with a specified width", () => {
            const range = SheetRange.region(2, 3, 4);
            expect(range).toEqual({
                from: { col: 2, row: 3 },
                to: { col: 5, row: undefined },
            });
        });

        it("should create a range for a rectangular region with a specified height", () => {
            const range = SheetRange.region(2, 3, undefined, 6);
            expect(range).toEqual({
                from: { col: 2, row: 3 },
                to: { col: undefined, row: 8 },
            });
        });

        it("should create a range for a rectangular region with both width and height", () => {
            const range = SheetRange.region(2, 3, 4, 6);
            expect(range).toEqual({
                from: { col: 2, row: 3 },
                to: { col: 5, row: 8 },
            });
        });
    });
});
