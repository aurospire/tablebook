import { ColorObject, Colors } from "../../types/types";
import { Range } from "../Cell";
import { SheetsRequest, SheetsAddSheetReply, SheetsApi, SheetsReply } from "./SheetsTypes";

export type SheetsReplyProcessor<Reply = SheetsReply> = (reply: Reply | undefined) => void;

export type SheetsAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: ColorObject;
};


const toWeighted = (color: ColorObject | undefined) => color ? Colors.toWeighted(color) : undefined;

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
                        tabColor: toWeighted(options.color),
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

    mergeCells(sheetId: number, range: Range) {
        return this.do({
            mergeCells: {
                range: {
                    sheetId,
                    startColumnIndex: range.start.col,
                    endColumnIndex: range.end.col,
                    startRowIndex: range.start.row,
                    endRowIndex: range.end.row
                }
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