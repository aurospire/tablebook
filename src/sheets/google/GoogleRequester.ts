import { sheets_v4 } from "@googleapis/sheets";
import { inspect } from "util";
import { BorderType, UnitSelector, UnitSelectorRegex } from "../../tables/types";
import { ColorObject, Colors } from "../../util/Color";
import { SheetAlign, SheetBorder, SheetBorderSet, SheetData, SheetExpression, SheetRangeSelector, SheetType, SheetValue, SheetWrap } from "../SheetData";
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

const chars: Record<string, string> = {
    '\t': 'CHAR(9)',
    '\n': 'CHAR(10)',
    '\r\n': 'CHAR(10)',
    '"': 'CHAR(34)'
};

const toFormulaString = (value: string): string => {
    return value.split(/(\t|\r?\n|")/).filter(Boolean).map(part => {
        const char = chars[part];
        return char ? char : `"${part}"`;
    }).join(' & ');
};

const charCodeA = 'A'.charCodeAt(0);

const letterfy = (value: number): string => {
    let result = '';

    do {
        result = String.fromCharCode(charCodeA + (value % 26 | 0)) + result;

        value = value / 26 | 0;
    } while (value);

    return result;
};

const modifyUnitSelector = (offset: UnitSelector | undefined | null, current: number, letter: boolean): string => {
    let base = '';

    let [_, type, number] = offset?.match(UnitSelectorRegex) ?? [];

    let value = Number(number ?? 0);
    console.log({ offset, type, number, base, value });

    if (type === '$')
        base = '$';
    else if (type === '-')
        value = current - value;
    else
        value = current + value;

    return base + (letter ? letterfy(value) : (value + 1).toString());
};

const toAddress = (selector: SheetRangeSelector | null, position: SheetPosition): string => {
    const col = modifyUnitSelector(selector?.start.col, position.col, true);

    const row = modifyUnitSelector(selector?.start.row, position.row, false);

    return col + row;
};

const toFormula = (exp: SheetExpression, position: SheetPosition): string => {
    switch (typeof exp) {
        case 'string':
            return toFormulaString(exp);
        case 'number':
            return exp.toString();
        case 'boolean':
            return exp.toString();
        case 'object':
            switch (exp.type) {
                case 'compound':
                    return exp.items.map(item => toFormula(item, position)).join(exp.with);
                case 'function':
                    return `${exp.name}(${exp.args.map(arg => toFormula(arg, position)).join(',')})`;
                case 'negated':
                    return `-(${toFormula(exp.on, position)})`;
                case 'self':
                    return toAddress(null, position);
                case 'selector':
                    return toAddress(exp.from, position);
            }
    }
};

const exp = <T>(value: T) => (console.log(value), value);

const getExtendedValue = (value: SheetValue, position: SheetPosition): GoogleCellValue | undefined => {
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


const SheetDataFieldMap: Record<string, string[]> = {
    back: ['userEnteredFormat.backgroundColorStyle'],
    fore: ['userEnteredFormat.textFormat.foregroundColorStyle'],
    bold: ['userEnteredFormat.textFormat.bold'],
    italic: ['userEnteredFormat.textFormat.italic'],
    horizontal: ['userEnteredFormat.horizontalAlignment'],
    vertical: ['userEnteredFormat.verticalAlignment'],
    wrap: ['userEnteredFormat.wrapStrategy'],
    type: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    pattern: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    value: ['userEnteredValue'],
} satisfies Record<keyof SheetData, string[]>;

const getFields = (from: string[] | SheetData): string[] => {
    const keys: string[] = Array.isArray(from) ? from : Object
        .entries(from)
        .filter(([_, v]) => v !== undefined)
        .map(([k]) => k);

    const fields = new Set<string>(keys.flatMap(key => SheetDataFieldMap[key] ?? []));

    return [...fields];
};

const toCellValue = (data: SheetData, position: SheetPosition): GoogleCellValue | undefined => {
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
                dataFormat.horizontalAlignment = GoogleHorizontalAlignment[data.horizontal];
            }
        }

        if (data.vertical !== undefined) {
            if (data.vertical !== null) {
                dataFormat ??= {};
                dataFormat.verticalAlignment = GoogleVerticalAlignment[data.vertical];
            }
        }

        if (data.wrap !== undefined) {
            if (data.wrap !== null) {
                dataFormat ??= {};
                dataFormat.wrapStrategy = GoogleWrap[data.wrap];
            }
        }

        if (data.type !== undefined || data.pattern !== undefined) {
            if (data.type !== null || data.pattern !== null) {
                numberFormat ??= {};
                numberFormat.type = data.type ? GoogleCellType[data.type] : GoogleCellType.text;
                numberFormat.pattern = data.pattern ? data.pattern : '';
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
            console.log(result);
            console.log(inspect(result.data, { depth: null, colors: true }));
        }
        return result;
    }
}


