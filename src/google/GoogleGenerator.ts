import { SheetBook } from "../sheets/SheetBook";
import { SheetGenerator } from "../sheets/SheetGenerator";
import { SheetRange } from "../sheets/SheetPosition";
import { GoogleSheet } from "./GoogleSheet";

export class GoogleGenerator implements SheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    async generate(book: SheetBook): Promise<void> {
        const sheet = this.#sheet;

        // clear the sheet
        const resetSheetId = await sheet.reset();

        await sheet.modify(r => r.setTitle(book.title));


        for (const page of book.pages) {
            const columnCount = page.groups.reduce((acc, group) => acc + group.columns.length, 0);

            const sheetId = await sheet.addSheet({ title: page.title, columns: columnCount, rows: page.rows });

            if (sheetId == undefined)
                throw new Error("Failed to add sheet");

            let index = 0;
            await sheet.modify(r => {
                const multigroup = page.groups.length > 1;

                for (const group of page.groups) {
                    if (multigroup) {
                        r = r.mergeCells(sheetId, SheetRange.row(0, index, group.columns.length))
                            .updateCells(sheetId, SheetRange.cell(index, 0), { value: group.title, horizontal: 'middle', vertical: 'middle' });

                        if (group.titleStyle?.beneath)
                            r = r.setBorder(sheetId, SheetRange.row(0, index, group.columns.length), { bottom: group.titleStyle.beneath });

                        if (group.titleStyle?.between)
                            r = r.setBorder(sheetId, SheetRange.row(0, index, group.columns.length), { left: group.titleStyle.between, right: group.titleStyle.between });
                    }
                }

                return r;
            });
        }

        // remove the reset sheet
        await sheet.modify(r => r.dropSheets(resetSheetId));
    }
}


//     async setTitle(title: string): Promise<void> {
//         this.#sheet.modify(r => r.setTitle(title));
//     }

//     async addSheet(data: SheetGeneratorSheetData): Promise<number> {
//         let resultId: number | undefined = await this.#sheet.addSheet(data);

//         if (resultId == undefined)
//             throw new Error("Failed to add sheet");

//         return resultId;
//     }

//     async addGroup({ sheetId, title, columnCount, columnStart, style }: SheetGeneratorGroupData): Promise<void> {
//         this.#sheet.modify(r => {
//             r = r
//                 .mergeCells(sheetId, SheetRange.row(0, columnStart, columnCount))
//                 .updateCells(sheetId, SheetRange.cell(columnStart, 0), { value: title, ...style, horizontal: 'middle', vertical: 'middle' });

//             if (style?.beneath) {
//                 r = r.setBorder(sheetId, SheetRange.row(0, columnStart, columnCount), { bottom: style.beneath });
//             }
//             if (style?.between)
//                 r = r.setBorder(sheetId, SheetRange.row(0, columnStart, columnCount), { left: style.between, right: style.between });

//             return r;
//         });
//     }

//     async addColumn({ sheetId, title, rows, columnIndex, rowOffset, groupCount, groupIndex, config }: SheetGeneratorColumnData): Promise<void> {
//         this.#sheet.modify(r => {
//             r = r
//                 .updateCells(sheetId, SheetRange.cell(columnIndex, rowOffset), {
//                     value: title,
//                     horizontal: 'middle', vertical: 'middle',
//                     ...config.titleStyle
//                 })
//                 .updateCells(sheetId, SheetRange.column(columnIndex, rowOffset + 1, rows - 1 - rowOffset), {
//                     horizontal: 'middle', vertical: 'middle',
//                     ...config.dataStyle
//                 });

//             if (config.titleStyle?.beneath)
//                 r = r.setBorder(sheetId, SheetRange.cell(columnIndex, rowOffset), { bottom: config.titleStyle.beneath });

//             if (config.titleStyle?.between)
//                 r = r.setBorder(sheetId, SheetRange.cell(columnIndex, rowOffset), {
//                     left: groupIndex !== 0 ? config.titleStyle.between : undefined,
//                     right: groupIndex != groupCount - 1 ? config.titleStyle.between : undefined
//                 });

//             return r;
//         });
//     }
// }