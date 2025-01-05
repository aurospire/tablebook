import { SheetColumnConfig } from "./SheetColumns";
import { SheetBorderSet, SheetStyle } from "./SheetStyle";
import { ColorObject } from "../util/Color";

// Core generator interface for platform implementations
export interface SheetGenerator {
    setTitle(title: string): Promise<void>;

    addSheet(
        title: string,
        rows: number,
        columns: number,
        color?: ColorObject
    ): Promise<number>;

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
        inGroup: boolean,
        config: SheetColumnConfig
    ): Promise<void>;
}