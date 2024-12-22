import { sheets_v4 } from "@googleapis/sheets";
import { inspect } from "util";
import { BorderType } from "../../tables/types";
import { ColorObject, Colors } from "../../util/Color";
import { nullSheetData, SheetBorder, SheetBorderSet, SheetAlign, SheetData, SheetType, SheetValue, SheetWrap } from "../SheetData";
import { SheetPosition, SheetRange } from "../SheetPosition";
import { GoogleAddSheetReply, GoogleApi, GoogleCellFormat, GoogleCellValue, GoogleNumberFormat, GoogleReply, GoogleRequest, GoogleTextFormat } from "./GoogleTypes";

export type GoogleReplyProcessor<Reply = GoogleReply> = (reply: Reply | undefined) => void;

export type GoogleAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: ColorObject;
};

const GoogleBorderMap = {
    none: 'NONE',
    thin: 'SOLID',
    medium: 'SOLID_MEDIUM',
    thick: 'SOLID_THICK',
    dotted: 'DOTTED',
    dashed: 'DASHED',
    double: 'DOUBLE',
} as const satisfies Record<BorderType, string>;

const toSheetsBorder = (border: SheetBorder | undefined): sheets_v4.Schema$Border | undefined => {
    return border ? {
        style: GoogleBorderMap[border.type],
        colorStyle: toWeightedColorStyle(border.color),
    } : undefined;
};

const toWeightedColorStyle = (color: ColorObject | undefined): sheets_v4.Schema$ColorStyle | undefined => {
    return color ? { rgbColor: Colors.toWeighted(color) } : undefined;
};

const toGridRange = (sheetId: number, range: SheetRange): sheets_v4.Schema$GridRange => ({
    sheetId,
    startColumnIndex: range.start.col,
    endColumnIndex: range.end?.col,
    startRowIndex: range.start.row,
    endRowIndex: range.end?.row
});

const getExtendedValue = (value: SheetValue, col: number, row: number): GoogleCellValue | undefined => {
    switch (typeof value) {
        case 'string':
            return { stringValue: value };
        case 'number':
            return { numberValue: value };
        case 'boolean':
            return { boolValue: value };
        case 'function':
            const formula = value(col, row);
            return { formulaValue: formula[0] === '=' ? formula : '=' + formula };

    }
};



const GoogleHorizontalAlignment = {
    start: 'LEFT',
    middle: 'CENTER',
    end: 'RIGHT'
} satisfies Record<SheetAlign, string>;

const GoogleVerticalAlignment = {
    start: 'TOP',
    middle: 'MIDDLE',
    end: 'BOTTOM'
} satisfies Record<SheetAlign, string>;

const GoogleWrap = {
    overflow: 'OVERFLOW_CELL',
    clip: 'CLIP',
    wrap: 'WRAP'
} satisfies Record<SheetWrap, string>;


const GoogleCellType = {
    text: 'TEXT',
    number: 'NUMBER',
    percent: 'PERCENT',
    currency: 'CURRENCY',
    date: 'DATE',
    time: 'TIME',
    datetime: 'DATE_TIME',
} satisfies Record<SheetType, string>;


const toCellValue = (data: SheetData, fields: string[] | null, col: number, row: number): GoogleCellValue | undefined => {
    if (data.value !== undefined) {
        fields?.push('userEnteredValue');
        if (data.value !== null)
            return getExtendedValue(data.value, col, row);
    }
};

const toCellFormat = (data: SheetData, fields: string[] | null): GoogleCellFormat | undefined => {
    let dataFormat: GoogleCellFormat | undefined;

    let textFormat: GoogleTextFormat | undefined;

    let numberFormat: GoogleNumberFormat | undefined;

    data = data === null ? nullSheetData : data;

    if (data) {
        if (data.back !== undefined) {
            fields?.push('userEnteredFormat.backgroundColorStyle');
            if (data.back !== null) {
                dataFormat ??= {};
                dataFormat.backgroundColorStyle = toWeightedColorStyle(data.back);
            }
        }

        if (data.fore !== undefined) {
            fields?.push('userEnteredFormat.textFormat.foregroundColorStyle');
            if (data.fore !== null) {
                textFormat ??= {};
                textFormat.foregroundColorStyle = toWeightedColorStyle(data.fore);
            }
        }

        if (data.bold !== undefined) {
            fields?.push('userEnteredFormat.textFormat.bold');
            if (data.bold !== null) {
                textFormat ??= {};
                textFormat.bold = data.bold;
            }
        }

        if (data.italic !== undefined) {
            fields?.push('userEnteredFormat.textFormat.italic');
            if (data.italic !== null) {
                textFormat ??= {};
                textFormat.italic = data.italic;
            }
        }


        if (data.horizontal !== undefined) {
            fields?.push('userEnteredFormat.horizontalAlignment');
            if (data.horizontal !== null) {
                dataFormat ??= {};
                dataFormat.horizontalAlignment = GoogleHorizontalAlignment[data.horizontal];
            }
        }

        if (data.vertical !== undefined) {
            fields?.push('userEnteredFormat.verticalAlignment');
            if (data.vertical !== null) {
                dataFormat ??= {};
                dataFormat.verticalAlignment = GoogleVerticalAlignment[data.vertical];
            }
        }

        if (data.wrap !== undefined) {
            fields?.push('userEnteredFormat.wrapStrategy');
            if (data.wrap !== null) {
                dataFormat ??= {};
                dataFormat.wrapStrategy = GoogleWrap[data.wrap];
            }
        }

        if (data.type !== undefined || data.pattern !== undefined) {
            fields?.push('userEnteredFormat.numberFormat.type');
            fields?.push('userEnteredFormat.numberFormat.pattern');
            if (data.type !== null || data.pattern !== null) {
                numberFormat ??= {};
                numberFormat.type = data.type ? GoogleCellType[data.type] : GoogleCellType.text;
                numberFormat.pattern = data.pattern ? data.pattern : '';
            }
        }
    }

    if (textFormat || numberFormat)
        dataFormat = { ...(dataFormat ?? {}), textFormat, numberFormat };

    console.log(inspect({ dataFormat, fields }, { depth: null, colors: true }));
    return dataFormat;
};

export class GoogleRequester {
    #requests: GoogleRequest[];
    #processors: GoogleReplyProcessor[];

    constructor(requests: GoogleRequest[] = [], processors: GoogleReplyProcessor[] = []) {
        this.#requests = requests;
        this.#processors = processors;
    }

    do(requests: GoogleRequest | GoogleRequest[], process?: GoogleReplyProcessor) {
        process ??= () => { };

        const newRequests = Array.isArray(requests) ? requests : [requests];

        const newProcessors = Array.isArray(requests) ? Array(requests.length).fill(process) : [process];

        return new GoogleRequester(
            [...this.#requests, ...newRequests],
            [...this.#processors, ...newProcessors]
        );
    }

    setTitle(title: string, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({
            updateSpreadsheetProperties: {
                properties: { title },
                fields: 'title',
            }
        }, process);
    }

    addSheet(options: GoogleAddSheetOptions, process?: (reply?: GoogleAddSheetReply, id?: number) => void): GoogleRequester {
        return this.do(
            {
                addSheet: {
                    properties: {
                        sheetId: options.id,
                        title: options.title,
                        tabColorStyle: toWeightedColorStyle(options.color),
                        gridProperties: { columnCount: options.columns, rowCount: options.rows }
                    }
                }
            },
            (reply) => { process?.(reply?.addSheet, reply?.addSheet?.properties?.sheetId ?? undefined); }
        );
    }

    dropSheets(ids: number | number[], process?: GoogleReplyProcessor): GoogleRequester {
        return this.do((Array.isArray(ids) ? ids : [ids]).map(id => ({ deleteSheet: { sheetId: id } }), process));
    }

    mergeCells(sheetId: number, range: SheetRange, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({ mergeCells: { range: toGridRange(sheetId, range) } }, process);
    }

    setBorder(sheetId: number, range: SheetRange, borders: SheetBorderSet, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({
            updateBorders: {
                range: toGridRange(sheetId, range),
                top: toSheetsBorder(borders.top),
                bottom: toSheetsBorder(borders.bottom),
                left: toSheetsBorder(borders.left),
                right: toSheetsBorder(borders.right),
            }
        }, process);
    }

    updateCells(sheetId: number, range: SheetRange, data: SheetData, process?: GoogleReplyProcessor): GoogleRequester {
        const fields: string[] = [];
        const format = toCellFormat(data, fields);
        const value = toCellValue(data, fields, range.start.col, range.start.row);

        if (fields.length)
            return this.do({
                repeatCell: {
                    range: toGridRange(sheetId, range),
                    cell: {
                        userEnteredValue: value,
                        userEnteredFormat: format
                    },
                    fields: fields.join(',')
                }
            }, process);

        return this;
    }

    updateRange<Data extends SheetData>(sheetId: number, from: SheetPosition, data: Data[][], process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({
            updateCells: {
                start: { sheetId, columnIndex: from.col, rowIndex: from.row },
            }
        });
    }

    async run(api: GoogleApi, id: string) {
        const result = await api.spreadsheets.batchUpdate({
            spreadsheetId: id,
            requestBody: {
                requests: this.#requests
            }
        });

        const replies = result.data.replies ?? [];

        for (let i = 0; i < this.#processors.length; i++)
            this.#processors[i](replies[i]);

        console.log(result);
        return result;
    }
}


