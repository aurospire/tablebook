import { Color } from "../Color";
import { SheetsRequest, SheetsAddSheetReply, SheetsApi, SheetsReply } from "./SheetsTypes";

export type SheetsReplyProcessor<Reply = SheetsReply> = (reply: Reply | undefined) => void;

export type SheetsAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: Color;
};


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

    addSheet(options: SheetsAddSheetOptions, process?: SheetsReplyProcessor<SheetsAddSheetReply>) {
        return this.do(
            {
                addSheet: {
                    properties: {
                        sheetId: options.id,
                        title: options.title,
                        tabColor: options.color,
                        gridProperties: { columnCount: options.columns, rowCount: options.rows }
                    }
                }
            },
            (reply) => { process?.(reply?.addSheet); }
        );
    }

    dropSheets(ids: number | number[]) {
        return Array.isArray(ids)
            ? this.#doBatch((ids).map(id => ({ deleteSheet: { sheetId: id } })))
            : this.do({ deleteSheet: { sheetId: ids } });
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

        return result;
    }
}