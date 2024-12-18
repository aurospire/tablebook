import { sheets_v4 } from "@googleapis/sheets";
import { SheetBorder, SheetBorderSet } from "../SheetBorder";
import { BorderType, ColorObject, Colors } from "../../tables/types";
import { SheetCellAlignment, SheetCellProperties, SheetCellType, SheetCellWrap, SheetRange } from "../SheetCell";
import { GoogleAddSheetReply, GoogleApi, GoogleReply, GoogleRequest } from "./GoogleTypes";

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
    endColumnIndex: range.end.col,
    startRowIndex: range.start.row,
    endRowIndex: range.end.row
});

const getExtendedValue = (value?: SheetCellProperties['value']): sheets_v4.Schema$ExtendedValue | undefined => {
    switch (typeof value) {
        case 'string':
            return { stringValue: value };
        case 'number':
            return { numberValue: value };
        case 'boolean':
            return { boolValue: value };
        default: {
            if (value && 'formula' in value) {
                const formula = value.formula;
                return { formulaValue: formula[0] === '=' ? formula : '=' + formula };
            }
        }
    }
};

const GoogleHorizontalAlignment = {
    start: 'LEFT',
    middle: 'CENTER',
    end: 'RIGHT'
} satisfies Record<SheetCellAlignment, string>;

const GoogleVerticalAlignment = {
    start: 'TOP',
    middle: 'MIDDLE',
    end: 'BOTTOM'
} satisfies Record<SheetCellAlignment, string>;

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

type GoogleCellData = sheets_v4.Schema$CellData;

const toCellData = (props: SheetCellProperties): { data: GoogleCellData, fields: string; } => {
    const fields: string[] = [];

    let data: GoogleCellData = {};

    let format: sheets_v4.Schema$CellFormat | undefined;

    let textFormat: sheets_v4.Schema$TextFormat | undefined;

    let numberFormat: sheets_v4.Schema$NumberFormat | undefined;

    if (props.value !== undefined) {
        if (props.value !== null)
            data.userEnteredValue = getExtendedValue(props.value);
        fields.push('userEnteredValue');
    }

    if (props.back !== undefined) {
        if (props.back !== null) {
            format ??= {};
            format.backgroundColorStyle = toWeightedColorStyle(props.back);
        }
        fields.push('userEnteredFormat.backgroundColorStyle');
    }

    if (props.fore !== undefined) {
        if (props.fore !== null) {
            textFormat ??= {};
            textFormat.foregroundColorStyle = toWeightedColorStyle(props.fore);
        }
        fields.push('userEnteredFormat.textFormat.foregroundColorStyle');
    }

    if (props.bold !== undefined) {
        if (props.bold !== null) {
            textFormat ??= {};
            textFormat.bold = props.bold;
        }
        fields.push('userEnteredFormat.textFormat.bold');
    }

    if (props.italic !== undefined) {
        if (props.italic !== null) {
            textFormat ??= {};
            textFormat.italic = props.italic;
        }
        fields.push('userEnteredFormat.textFormat.italic');
    }


    if (props.horizontal !== undefined) {
        if (props.horizontal !== null) {
            format ??= {};
            format.horizontalAlignment = GoogleHorizontalAlignment[props.horizontal];
        }
        fields.push('userEnteredFormat.horizontalAlignment');
    }

    if (props.vertical !== undefined) {
        if (props.vertical !== null) {
            format ??= {};
            format.verticalAlignment = GoogleVerticalAlignment[props.vertical];
        }
        fields.push('userEnteredFormat.verticalAlignment');
    }

    if (props.wrap !== undefined) {
        if (props.wrap !== null) {
            format ??= {};
            format.wrapStrategy = GoogleWrap[props.wrap];
        }
        fields.push('userEnteredFormat.wrapStrategy');
    }

    if (props.type !== undefined || props.format !== undefined) {
        if (props.type !== null || props.format !== null) {
            numberFormat ??= {};
            numberFormat.type = props.type ? GoogleCellType[props.type] : GoogleCellType.text;
            numberFormat.pattern = props.format ? props.format : '';
        }

        fields.push('userEnteredFormat.numberFormat.type');
        fields.push('userEnteredFormat.numberFormat.pattern');
    }


    if (textFormat || numberFormat)
        format = { ...(format ?? {}), textFormat, numberFormat };

    if (format)
        data = { ...(data ?? {}), userEnteredFormat: format };

    return { data, fields: fields.join(',') };
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

    setTitle(title: string, process?: GoogleReplyProcessor) {
        return this.do({
            updateSpreadsheetProperties: {
                properties: { title },
                fields: 'title',
            }
        }, process);
    }

    addSheet(options: GoogleAddSheetOptions, process?: (reply?: GoogleAddSheetReply, id?: number) => void) {
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

    dropSheets(ids: number | number[], process?: GoogleReplyProcessor) {
        return this.do((Array.isArray(ids) ? ids : [ids]).map(id => ({ deleteSheet: { sheetId: id } }), process));
    }

    mergeCells(sheetId: number, range: SheetRange, process?: GoogleReplyProcessor) {
        return this.do({ mergeCells: { range: toGridRange(sheetId, range) } }, process);
    }

    setBorder(sheetId: number, range: SheetRange, borders: SheetBorderSet, process?: GoogleReplyProcessor) {
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

    updateCell(sheedId: number, col: number, row: number, props: SheetCellProperties, process?: GoogleReplyProcessor) {
        const { data, fields } = toCellData(props);

        return this.do({
            updateCells: {
                start: { sheetId: sheedId, columnIndex: col, rowIndex: row },
                rows: [{
                    values: [data]
                }],
                fields: fields
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