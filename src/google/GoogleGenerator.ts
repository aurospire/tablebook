import { GoogleSheet } from "./GoogleSheet";
import { SheetGenerator } from "../sheets/SheetGenerator";
import { SheetColumnConfig } from "../sheets/SheetColumns";
import { SheetBorderSet, SheetStyle } from "../sheets/SheetStyle";
import { ColorObject } from "../util/Color";
import { SheetRange } from "../sheets/SheetPosition";

export class GoogleGenerator implements SheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    get sheet(): GoogleSheet { return this.#sheet; }

    async setTitle(title: string): Promise<void> {
        this.#sheet.modify(r => r.setTitle(title));
    }

    async addSheet(title: string, rows: number, columns: number, color?: ColorObject): Promise<number> {
        let resultId: number | undefined = await this.#sheet.addSheet({ title, rows, columns, color });

        if (resultId == undefined)
            throw new Error("Failed to add sheet");

        return resultId;
    }

    async addGroup(sheetId: number, name: string, columnStart: number, columnCount: number, style?: SheetStyle, borders?: SheetBorderSet): Promise<void> {
        this.#sheet.modify(r => {
            r = r
                .mergeCells(sheetId, SheetRange.row(0, columnStart, columnCount))
                .updateCells(sheetId, SheetRange.cell(columnStart, 0), { value: name, ...style, horizontal: 'middle', vertical: 'middle' });

            if (borders)
                r = r.setBorder(sheetId, SheetRange.row(0, columnStart, columnCount), borders);

            return r;
        });
    }

    async addColumn(sheetId: number, name: string, columnIndex: number, inGroup: boolean, config: SheetColumnConfig): Promise<void> {
        this.#sheet.modify(r => r.updateCells(sheetId, SheetRange.cell(columnIndex, inGroup ? 1 : 0), {
            value: name,
            horizontal: 'middle', vertical: 'middle',
            ...config,
        }));
    }
}