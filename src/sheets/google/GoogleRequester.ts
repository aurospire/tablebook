import { sheets_v4 } from "@googleapis/sheets";
import { inspect } from "util";
import { BorderType, ColorObject, Colors } from "../../tables/types";
import { SheetRange } from "../SheetAddress";
import { SheetCell } from "../SheetCell";
import { nullSheetCellProperties, SheetBorder, SheetBorderSet, SheetCellAlign, SheetCellType, SheetCellWrap } from "../SheetCellProperties";
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

const toWeightedColorStyle = (color: ColorObject | undefined): sheets_v4.Schema$ColorStyle | undefined =>
    color ? { rgbColor: Colors.toWeighted(color) } : undefined;

const toGridRange = (sheetId: number, range: SheetRange): sheets_v4.Schema$GridRange => ({
    sheetId,
    startColumnIndex: range.start.col,
    endColumnIndex: range.end?.col,
    startRowIndex: range.start.row,
    endRowIndex: range.end?.row
});

const getExtendedValue = (value: SheetCell['value'], col: number, row: number): GoogleCellValue | undefined => {
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
} satisfies Record<SheetCellAlign, string>;

const GoogleVerticalAlignment = {
    start: 'TOP',
    middle: 'MIDDLE',
    end: 'BOTTOM'
} satisfies Record<SheetCellAlign, string>;

const GoogleWrap = {
    overflow: 'OVERFLOW_CELL',
    clip: 'CLIP',
    wrap: 'WRAP'
} satisfies Record<SheetCellWrap, string>;


const GoogleCellType = {
    text: 'TEXT',
    number: 'NUMBER',
    percent: 'PERCENT',
    currency: 'CURRENCY',
    date: 'DATE',
    time: 'TIME',
    datetime: 'DATE_TIME',
} satisfies Record<SheetCellType, string>;


const toCellValue = (value: SheetCell['value'], fields: string[], col: number, row: number): GoogleCellValue | undefined => {
    if (value !== undefined) {
        fields.push('userEnteredValue');
        if (value !== null)
            return getExtendedValue(value, col, row);
    }
};

const toCellFormat = (props: SheetCell['props'], fields: string[]): GoogleCellFormat | undefined => {
    let dataFormat: GoogleCellFormat | undefined;

    let textFormat: GoogleTextFormat | undefined;

    let numberFormat: GoogleNumberFormat | undefined;

    props = props === null ? nullSheetCellProperties : props;

    if (props) {
        if (props.back !== undefined) {
            fields.push('userEnteredFormat.backgroundColorStyle');
            if (props.back !== null) {
                dataFormat ??= {};
                dataFormat.backgroundColorStyle = toWeightedColorStyle(props.back);
            }
        }

        if (props.fore !== undefined) {
            fields.push('userEnteredFormat.textFormat.foregroundColorStyle');
            if (props.fore !== null) {
                textFormat ??= {};
                textFormat.foregroundColorStyle = toWeightedColorStyle(props.fore);
            }
        }

        if (props.bold !== undefined) {
            fields.push('userEnteredFormat.textFormat.bold');
            if (props.bold !== null) {
                textFormat ??= {};
                textFormat.bold = props.bold;
            }
        }

        if (props.italic !== undefined) {
            fields.push('userEnteredFormat.textFormat.italic');
            if (props.italic !== null) {
                textFormat ??= {};
                textFormat.italic = props.italic;
            }
        }


        if (props.horizontal !== undefined) {
            fields.push('userEnteredFormat.horizontalAlignment');
            if (props.horizontal !== null) {
                dataFormat ??= {};
                dataFormat.horizontalAlignment = GoogleHorizontalAlignment[props.horizontal];
            }
        }

        if (props.vertical !== undefined) {
            fields.push('userEnteredFormat.verticalAlignment');
            if (props.vertical !== null) {
                dataFormat ??= {};
                dataFormat.verticalAlignment = GoogleVerticalAlignment[props.vertical];
            }
        }

        if (props.wrap !== undefined) {
            fields.push('userEnteredFormat.wrapStrategy');
            if (props.wrap !== null) {
                dataFormat ??= {};
                dataFormat.wrapStrategy = GoogleWrap[props.wrap];
            }
        }

        if (props.type !== undefined || props.pattern !== undefined) {
            fields.push('userEnteredFormat.numberFormat.type');
            fields.push('userEnteredFormat.numberFormat.pattern');
            if (props.type !== null || props.pattern !== null) {
                numberFormat ??= {};
                numberFormat.type = props.type ? GoogleCellType[props.type] : GoogleCellType.text;
                numberFormat.pattern = props.pattern ? props.pattern : '';
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

    updateCell(sheedId: number, col: number, row: number, cell: SheetCell, process?: GoogleReplyProcessor): GoogleRequester {
        const fields: string[] = [];
        const value = toCellValue(cell.value, fields, col, row);
        const format = toCellFormat(cell.props, fields);

        if (fields.length)
            return this.do({
                updateCells: {
                    start: { sheetId: sheedId, columnIndex: col, rowIndex: row },
                    rows: [{
                        values: [{
                            userEnteredValue: value,
                            userEnteredFormat: format
                        }]
                    }],
                    fields: fields.join(',')
                }
            });

        return this;
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