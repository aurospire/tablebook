import { sheets_v4 } from "@googleapis/sheets";
import { SheetBorder, SheetBorderSet } from "../SheetBorder";
import { BorderType, ColorObject, Colors } from "../../tables/types";
import { SheetRange } from "../SheetCell";
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
        colorStyle: { rgbColor: toWeightedColor(border.color) },
    } : undefined;
};

const toWeightedColor = (color: ColorObject | undefined) => color ? Colors.toWeighted(color) : undefined;

const toGridRange = (sheetId: number, range: SheetRange): sheets_v4.Schema$GridRange => ({
    sheetId,
    startColumnIndex: range.start.col,
    endColumnIndex: range.end.col,
    startRowIndex: range.start.row,
    endRowIndex: range.end.row
});


//addGroup(sheetId: number, title: string, columnStart: number, columnCount: number, style ?: SheetStyle, borders ?: SheetBorderConfig): Promise<void>;


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
                        tabColor: toWeightedColor(options.color),
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

    setCellText(sheedId: number, col: number, row: number, value: string, process?: GoogleReplyProcessor) {

    }

    setRangeData(sheedId: number, range: SheetRange, data: string[][], process?: GoogleReplyProcessor) {

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