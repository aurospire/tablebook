import { sheets_v4 } from "@googleapis/sheets";
import { SheetBorder, SheetBorderSet } from "../SheetTypes";
import { BorderType, ColorObject, Colors } from "../../tables/types";
import { SheetRange } from "../SheetCell";
import { SheetsAddSheetReply, SheetsApi, SheetsReply, SheetsRequest } from "./SheetsTypes";

export type SheetsReplyProcessor<Reply = SheetsReply> = (reply: Reply | undefined) => void;

export type SheetsAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: ColorObject;
};


const SheetsBorderMap = {
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
        style: SheetsBorderMap[border.type],
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


export class SheetsRequester {
    #requests: SheetsRequest[];
    #processors: SheetsReplyProcessor[];

    constructor(requests: SheetsRequest[] = [], processors: SheetsReplyProcessor[] = []) {
        this.#requests = requests;
        this.#processors = processors;
    }

    do(request: SheetsRequest, process?: SheetsReplyProcessor) {
        return new SheetsRequester(
            [...this.#requests, request],
            [...this.#processors, process ?? (() => { })]
        );
    }

    #doBatch(requests: SheetsRequest[]) {
        return new SheetsRequester(
            [...this.#requests, ...requests],
            [...this.#processors, ...Array(requests.length).fill(() => { })]
        );
    }

    setTitle(title: string) {
        return this.do({
            updateSpreadsheetProperties: {
                properties: { title },
                fields: 'title',
            }
        });
    }

    addSheet(options: SheetsAddSheetOptions, process?: (reply?: SheetsAddSheetReply, id?: number) => void) {
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

    dropSheets(ids: number | number[]) {
        return Array.isArray(ids)
            ? this.#doBatch((ids).map(id => ({ deleteSheet: { sheetId: id } })))
            : this.do({ deleteSheet: { sheetId: ids } });
    }

    mergeCells(sheetId: number, range: SheetRange) {
        return this.do({ mergeCells: { range: toGridRange(sheetId, range) } });
    }

    setBorder(sheetId: number, range: SheetRange, borders: SheetBorderSet) {
        return this.do({
            updateBorders: {
                range: toGridRange(sheetId, range),
                top: toSheetsBorder(borders.top),
                bottom: toSheetsBorder(borders.bottom),
                left: toSheetsBorder(borders.left),
                right: toSheetsBorder(borders.right),
            }
        });
    }

    async run(api: SheetsApi, id: string) {
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