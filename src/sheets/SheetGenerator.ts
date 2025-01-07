import { ColorObject } from "../util/Color";
import { SheetColumnConfig, SheetHeaderStyle } from "./SheetColumns";

export type SheetGeneratorSheetData = {
    title: string,
    rows: number,
    columns: number,
    color?: ColorObject;
};

export type SheetGeneratorGroupData = {
    sheetId: number,
    title: string,
    columnStart: number,
    columnCount: number,
    style?: SheetHeaderStyle,
};

export type SheetGeneratorColumnData = {
    sheetId: number,
    title: string,
    rows: number,
    columnIndex: number,
    rowOffset: number,
    groupIndex: number,
    groupCount: number,
    config: SheetColumnConfig;
};

// Core generator interface for platform implementations
export interface SheetGenerator {
    setTitle(title: string): Promise<void>;

    addSheet(data: SheetGeneratorSheetData): Promise<number>;

    addGroup(data: SheetGeneratorGroupData): Promise<void>;

    addColumn(data: SheetGeneratorColumnData): Promise<void>;
}