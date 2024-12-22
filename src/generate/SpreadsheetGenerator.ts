import { SheetBorderSet, SheetStyle } from "../sheets/SheetData";
import { SheetColumnConfig } from "../sheets/SheetColumns";

// Core generator interface for platform implementations
export interface SpreadsheetGenerator {
    setTitle(title: string): Promise<void>;

    addSheet(title: string, rows: number, columns: number): Promise<number>;

    addGroup(
        sheetId: number,
        title: string,
        columnStart: number,
        columnCount: number,
        style?: SheetStyle,
        borders?: SheetBorderSet
    ): Promise<void>;

    addColumn(
        sheetId: number,
        title: string,
        columnIndex: number,
        config: SheetColumnConfig
    ): Promise<void>;
}