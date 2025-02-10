import { TableBookGenerateIssue } from "../issues";
import { SheetBook, SheetPage } from "../sheets/SheetBook";
import { SheetGenerator } from "../sheets/SheetGenerator";
import { SheetRange } from "../sheets/SheetRange";
import { Result } from "../util";
import { GoogleSheet } from "./GoogleSheet";

type PageInfo = {
    sheetId: number;
    columns: number;
    page: SheetPage;
    multigroup?: boolean;
    totalRows: number;
    dataRows: number;
};

export class GoogleGenerator implements SheetGenerator {
    #sheet: GoogleSheet;
    #reset: boolean;

    constructor(sheet: GoogleSheet, reset: boolean) {
        this.#sheet = sheet;

        this.#reset = reset;
    }

    async generate(book: SheetBook): Promise<Result<undefined, TableBookGenerateIssue[]>> {
        try {
            const sheet = this.#sheet;


            await sheet.modify(r => r.setTitle(book.title));

            // Optionally Reset the Sheet
            const resetSheetId = this.#reset ? await sheet.reset() : undefined;

            const pageInfos: PageInfo[] = [];

            // Add all Pages first
            for (const page of book.pages) {
                const columnCount = page.groups.reduce((total, group) => total + group.columns.length, 0);

                const multigroup = page.groups.length > 1;

                const dataRows = page.rows;

                const totalRows = dataRows + (multigroup ? 2 : 1);

                if (columnCount) {
                    const sheetId = await sheet.addSheet({ title: page.title, columns: columnCount, rows: totalRows, color: page.tabColor });

                    if (sheetId == undefined)
                        throw new Error("Failed to add sheet");

                    pageInfos.push({ sheetId: sheetId, columns: columnCount, page, multigroup, totalRows, dataRows });
                }
            }

            // Remove the Reset Sheet
            if (resetSheetId && pageInfos.length)
                await sheet.modify(r => r.dropSheets(resetSheetId));


            // Process each Page
            for (const pageInfo of pageInfos) {
                const { sheetId, page, multigroup, totalRows, dataRows } = pageInfo;

                await sheet.modify(r => {
                    let index = 0;

                    // Group
                    for (const group of page.groups) {

                        // Only add group header if there are multiple groups
                        if (multigroup) {
                            if (group.columns.length) {
                                r = r
                                    .mergeCells(sheetId, SheetRange.row(0, index, group.columns.length))
                                    .updateCells(sheetId, SheetRange.cell(index, 0), { value: group.title, horizontal: 'middle', vertical: 'middle', ...group.titleStyle });

                                if (group.titleStyle?.beneath)
                                    r = r.setBorder(sheetId, SheetRange.row(0, index, group.columns.length), { bottom: group.titleStyle.beneath });

                                if (group.titleStyle?.between)
                                    r = r.setBorder(sheetId,
                                        SheetRange.region(index, 0, group.columns.length, totalRows),
                                        { left: group.titleStyle.between, right: group.titleStyle.between }
                                    );
                            }
                        }

                        for (let c = 0; c < group.columns.length; c++) {
                            const rowOffset = multigroup ? 1 : 0;

                            const column = group.columns[c];


                            // Header
                            r = r.updateCells(sheetId, SheetRange.cell(index, rowOffset), {
                                value: column.title,
                                horizontal: 'middle', vertical: 'middle',
                                ...column.titleStyle
                            });


                            // Data
                            const columnRange = SheetRange.column(index, rowOffset + 1, dataRows);

                            const dataRange = SheetRange.column(index, rowOffset + 1, dataRows);

                            const valueItems = column.values?.items ?? [];

                            for (const item of valueItems) {
                                r = r.updateCells(sheetId, { from: dataRange.from }, {
                                    horizontal: 'middle', vertical: 'middle',
                                    ...column.dataStyle,
                                    value: item,
                                    kind: column.behavior?.kind,
                                    format: column.behavior?.format
                                });

                                dataRange.from.row++;
                            }

                            if (valueItems.length < dataRows)
                                r = r.updateCells(sheetId, dataRange, {
                                    horizontal: 'middle', vertical: 'middle',
                                    ...column.dataStyle,
                                    value: column.values?.rest,
                                    kind: column.behavior?.kind,
                                    format: column.behavior?.format
                                });

                            if (column.behavior?.rule)
                                r = r.setDataValidation(sheetId, columnRange, column.behavior.rule, true);

                            if (column.behavior?.styles)
                                for (let s = column.behavior.styles.length - 1; s >= 0; s--) {
                                    const style = column.behavior.styles[s];
                                    r = r.setConditionalFormat(sheetId, columnRange, style);
                                }

                            if (column.titleStyle?.beneath)
                                r = r.setBorder(sheetId, SheetRange.cell(index, rowOffset), { bottom: column.titleStyle.beneath });


                            if (column.titleStyle?.between) {
                                const showLeft = c !== 0;
                                const showRight = c != group.columns.length - 1;

                                if (showLeft || showRight)
                                    r = r.setBorder(sheetId, SheetRange.region(index, rowOffset, 1, totalRows - rowOffset), {
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

            return Result.success(undefined);
        }
        catch (error: any) {
            return Result.failure([{ type: 'generating', message: error.message, data: book }]);
        }
    }
}