import { sheets_v4 } from "@googleapis/sheets";
import { inspect } from "util";
import { ColorObject, Colors } from "../util/Color";
import { SheetBorder, SheetBorderSet, SheetData, SheetValue } from "../sheets/SheetData";
import { toFormula } from "../sheets/SheetExpression";
import { toPattern } from "../sheets/SheetKind";
import { SheetPosition, SheetRange, SheetSelector } from "../sheets/SheetPosition";
import { GoogleBorderMap, GoogleCellTypeMap, GoogleFieldMap, GoogleHorizontalAlignMap, GoogleVerticalAlignMap, GoogleWrapMap } from "./GoogleMaps";
import { GoogleAddSheetReply, GoogleApi, GoogleCellFormat, GoogleCellValue, GoogleCondition, GoogleNumberFormat, GoogleReply, GoogleRequest, GoogleTextFormat } from "./GoogleTypes";
import { SheetConditionalFormat, SheetRule } from "../sheets/SheetRule";
import { toGoogleCondition } from "./GoogleCondition";

export type GoogleReplyProcessor<Reply = GoogleReply> = (reply: Reply | undefined) => void;

export type GoogleAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: ColorObject;
};


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
    endColumnIndex: range.end ? range.end.col : range.start.col + 1,
    startRowIndex: range.start.row,
    endRowIndex: range.end ? range.end.row : range.start.row + 1,
});



const exp = <T>(value: T) => (console.log(value), value);

const getExtendedValue = (value: SheetValue, position: SheetPosition<number>): GoogleCellValue | undefined => {
    switch (typeof value) {
        case 'string':
            return { stringValue: value };
        case 'number':
            return { numberValue: value };
        case 'boolean':
            return { boolValue: value };
        default:
            return { formulaValue: exp('=' + toFormula(value, position)) };
    }
};



const getFields = (from: string[] | SheetData): string[] => {
    const keys: string[] = Array.isArray(from) ? from : Object
        .entries(from)
        .filter(([_, v]) => v !== undefined)
        .map(([k]) => k);

    const fields = new Set<string>(keys.flatMap(key => GoogleFieldMap[key] ?? []));

    return [...fields];
};

const toCellValue = (data: SheetData, position: SheetPosition<number>): GoogleCellValue | undefined => {
    if (data.value !== undefined) {
        if (data.value !== null)
            return getExtendedValue(data.value, position);
    }
};

const toCellFormat = (data: SheetData): GoogleCellFormat | undefined => {
    let dataFormat: GoogleCellFormat | undefined;

    let textFormat: GoogleTextFormat | undefined;

    let numberFormat: GoogleNumberFormat | undefined;

    if (data) {
        if (data.back !== undefined) {
            if (data.back !== null) {
                dataFormat ??= {};
                dataFormat.backgroundColorStyle = toWeightedColorStyle(data.back);
            }
        }

        if (data.fore !== undefined) {
            if (data.fore !== null) {
                textFormat ??= {};
                textFormat.foregroundColorStyle = toWeightedColorStyle(data.fore);
            }
        }

        if (data.bold !== undefined) {
            if (data.bold !== null) {
                textFormat ??= {};
                textFormat.bold = data.bold;
            }
        }

        if (data.italic !== undefined) {
            if (data.italic !== null) {
                textFormat ??= {};
                textFormat.italic = data.italic;
            }
        }


        if (data.horizontal !== undefined) {
            if (data.horizontal !== null) {
                dataFormat ??= {};
                dataFormat.horizontalAlignment = GoogleHorizontalAlignMap[data.horizontal];
            }
        }

        if (data.vertical !== undefined) {
            if (data.vertical !== null) {
                dataFormat ??= {};
                dataFormat.verticalAlignment = GoogleVerticalAlignMap[data.vertical];
            }
        }

        if (data.wrap !== undefined) {
            if (data.wrap !== null) {
                dataFormat ??= {};
                dataFormat.wrapStrategy = GoogleWrapMap[data.wrap];
            }
        }

        if (data.type !== undefined || data.format !== undefined) {
            if (data.type !== null || data.format !== null) {
                numberFormat ??= {};
                numberFormat.type = data.type ? GoogleCellTypeMap[data.type] : GoogleCellTypeMap.text;
                numberFormat.pattern = data.format ? exp(toPattern(data.format)) : '';
            }
        }
    }

    if (textFormat || numberFormat)
        dataFormat = { ...(dataFormat ?? {}), textFormat, numberFormat };

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
        const fields: string[] = getFields(data);
        const format = toCellFormat(data);
        const value = toCellValue(data, range.start);

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

    setDataValidation(sheetId: number, range: SheetRange, rule: SheetRule, strict: boolean): GoogleRequester {
        return this.do({
            setDataValidation: exp({
                range: toGridRange(sheetId, range),
                rule: {
                    condition: toGoogleCondition(rule, range.start),
                    strict,                    
                    showCustomUi: rule.type === 'enum' || rule.type === 'lookup',
                }
            })
        });
    }

    setConditionalFormat(sheetId: number, range: SheetRange, format: SheetConditionalFormat): GoogleRequester {
        return this.do({
            addConditionalFormatRule: exp({
                rule: {
                    ranges: [toGridRange(sheetId, range)],
                    booleanRule: {
                        condition: toGoogleCondition(format.rule, range.start),
                        format: toCellFormat(format.style)
                    }
                }
            })
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

        if (result.status > 300) {
            console.error(result);
            console.error(inspect(result.data, { depth: null, colors: true }));
        }
        return result;
    }
}


