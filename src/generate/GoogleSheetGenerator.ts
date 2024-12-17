import { GoogleSheet } from "../util/sheets/GoogleSheet";
import { SheetBorderConfig, SheetColumnConfig, SheetStyle, SpreadsheetGenerator } from "./SpreadsheetGenerator";

export class GoogleSheetGenerator implements SpreadsheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    get sheet(): GoogleSheet { return this.#sheet; }

    async setTitle(title: string): Promise<void> {
        await this.sheet.setTitle(title);
    }

    async addSheet(name: string, rows: number, columns: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async addGroup(sheet: number, name: string, columnStart: number, columnCount: number, style?: SheetStyle, borders?: SheetBorderConfig): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addColumn(sheet: number, name: string, columnIndex: number, config: SheetColumnConfig): Promise<void> {
        throw new Error("Method not implemented.");
    }
}