import { TableBookGenerateIssue, TableBookResult } from "../issues";
import { SheetBook } from "../sheets/SheetBook";
import { SheetGenerator } from "../sheets/SheetGenerator";
import { SheetRange } from "../sheets/SheetRange";
import { GoogleSheet } from "./GoogleSheet";

export class GoogleGenerator implements SheetGenerator {
    #sheet: GoogleSheet;

    constructor(sheet: GoogleSheet) {
        this.#sheet = sheet;
    }

    async generate(book: SheetBook): Promise<TableBookResult<undefined, TableBookGenerateIssue>> {
        const sheet = this.#sheet;

        // clear the sheet
        const resetSheetId = await sheet.reset();

        await sheet.modify(r => r.setTitle(book.title));


        for (const page of book.pages) {
            const columnCount = page.groups.reduce((acc, group) => acc + group.columns.length, 0);

            const sheetId = await sheet.addSheet({ title: page.title, columns: columnCount, rows: page.rows, color: page.tabColor });

            if (sheetId == undefined)
                throw new Error("Failed to add sheet");

            await sheet.modify(r => {
                const multigroup = page.groups.length > 1;

                let index = 0;

                for (const group of page.groups) {
                    if (multigroup) {
                        r = r
                            .mergeCells(sheetId, SheetRange.row(0, index, group.columns.length))
                            .updateCells(sheetId, SheetRange.cell(index, 0), { value: group.title, horizontal: 'middle', vertical: 'middle', ...group.titleStyle });

                        if (group.titleStyle?.beneath)
                            r = r.setBorder(sheetId, SheetRange.row(0, index, group.columns.length), { bottom: group.titleStyle.beneath });

                        if (group.titleStyle?.between)
                            r = r.setBorder(sheetId, SheetRange.region(index, 0, group.columns.length, page.rows), { left: group.titleStyle.between, right: group.titleStyle.between });
                    }

                    for (let c = 0; c < group.columns.length; c++) {
                        const rowOffset = multigroup ? 1 : 0;

                        const column = group.columns[c];


                        // header
                        r = r.updateCells(sheetId, SheetRange.cell(index, rowOffset), {
                            value: column.title,
                            horizontal: 'middle', vertical: 'middle',
                            ...column.titleStyle
                        });


                        // data
                        const columnRange = SheetRange.column(index, rowOffset + 1, page.rows - 1 - rowOffset);

                        r = r.updateCells(sheetId, columnRange, {
                            horizontal: 'middle', vertical: 'middle',
                            ...column.dataStyle,
                            value: column.formula,
                            kind: column.behavior?.kind,
                            format: column.behavior?.format
                        });

                        if (column.behavior?.rule)
                            r = r.setDataValidation(sheetId, columnRange, column.behavior.rule, true);

                        if (column.behavior?.styles)
                            for (const format of column.behavior.styles)
                                r = r.setConditionalFormat(sheetId, columnRange, format);

                        if (column.titleStyle?.beneath)
                            r = r.setBorder(sheetId, SheetRange.cell(index, rowOffset), { bottom: column.titleStyle.beneath });


                        if (column.titleStyle?.between) {
                            const showLeft = c !== 0;
                            const showRight = c != group.columns.length - 1;

                            if (showLeft || showRight)
                                r = r.setBorder(sheetId, SheetRange.region(index, rowOffset, 1, page.rows - rowOffset), {
                                    left: showLeft ? column.titleStyle.between : undefined,
                                    right: showRight ? column.titleStyle.between : undefined
                                });
                        }

                        index++;
                    }
                }

                return r;
            });
        }

        // remove the reset sheet
        await sheet.modify(r => r.dropSheets(resetSheetId));

        return { success: true, data: undefined };
    }
}