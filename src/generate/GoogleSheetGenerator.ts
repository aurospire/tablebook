import { GoogleSheet } from "../sheets/google/GoogleSheet";
import { SpreadsheetGenerator } from "./SpreadsheetGenerator";
import { SheetColumnConfig } from "../sheets/SheetColumns";
import { SheetBorderSet, SheetStyle } from "../sheets/SheetData";


export class GoogleSheetGenerator implements SpreadsheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    get sheet(): GoogleSheet { return this.#sheet; }

    async setTitle(title: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addSheet(name: string, rows: number, columns: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async addGroup(sheet: number, name: string, columnStart: number, columnCount: number, style?: SheetStyle, borders?: SheetBorderSet): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addColumn(sheet: number, name: string, columnIndex: number, config: SheetColumnConfig): Promise<void> {
        throw new Error("Method not implemented.");
    }
}