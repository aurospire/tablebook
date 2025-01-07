import { SheetColumnConfig, SheetHeaderPartitions } from "../sheets/SheetColumns";
import { SheetGenerator, SheetGeneratorColumnData, SheetGeneratorGroupData, SheetGeneratorSheetData } from "../sheets/SheetGenerator";
import { SheetRange } from "../sheets/SheetPosition";
import { SheetAlign, SheetStyle } from "../sheets/SheetStyle";
import { ColorObject } from "../util/Color";
import { GoogleSheet } from "./GoogleSheet";

export class GoogleGenerator implements SheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    get sheet(): GoogleSheet { return this.#sheet; }

    async setTitle(title: string): Promise<void> {
        this.#sheet.modify(r => r.setTitle(title));
    }

    async addSheet(data: SheetGeneratorSheetData): Promise<number> {
        let resultId: number | undefined = await this.#sheet.addSheet(data);

        if (resultId == undefined)
            throw new Error("Failed to add sheet");

        return resultId;
    }

    async addGroup({ sheetId, title, columnCount, columnStart, style }: SheetGeneratorGroupData): Promise<void> {
        this.#sheet.modify(r => {
            r = r
                .mergeCells(sheetId, SheetRange.row(0, columnStart, columnCount))
                .updateCells(sheetId, SheetRange.cell(columnStart, 0), { value: title, ...style, horizontal: 'middle', vertical: 'middle' });

            if (style?.beneath)
                r = r.setBorder(sheetId, SheetRange.row(0, columnStart, columnCount), { bottom: style.beneath });

            if (style?.between)
                r = r.setBorder(sheetId, SheetRange.row(0, columnStart, columnCount), { left: style.between, right: style.between });

            return r;
        });
    }

    async addColumn({ sheetId, title, rows, columnIndex, rowOffset, groupCount, groupIndex, config }: SheetGeneratorColumnData): Promise<void> {
        console.log({ title, rows, columnIndex, rowOffset, groupCount, groupIndex });
        this.#sheet.modify(r => {
            r = r
                .updateCells(sheetId, SheetRange.cell(columnIndex, rowOffset), {
                    value: title,
                    horizontal: 'middle', vertical: 'middle',
                    ...config.headerStyle
                })
                .updateCells(sheetId, SheetRange.column(columnIndex, rowOffset + 1, rows - 1 - rowOffset), {
                    horizontal: 'middle', vertical: 'middle',
                    ...config.dataStyle
                });

            if (config.headerStyle?.beneath)
                r = r.setBorder(sheetId, SheetRange.cell(columnIndex, rowOffset), { bottom: config.headerStyle.beneath });

            if (config.headerStyle?.between)
                r = r.setBorder(sheetId, SheetRange.cell(columnIndex, rowOffset), {
                    left: groupIndex !== 0 ? config.headerStyle.between : undefined,
                    right: groupIndex != groupCount - 1 ? config.headerStyle.between : undefined
                });

            return r;
        });
    }
}