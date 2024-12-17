import { auth, sheets, sheets_v4 } from '@googleapis/sheets';
import { Color } from './Color';

export type SheetsApi = sheets_v4.Sheets;

export type SheetsApiRequest = sheets_v4.Schema$Request;


export type SheetsApiLogin = { email: string, key: string; };

export type SheetsApiSource = { api: SheetsApi; } | SheetsApiLogin;


export type WorkBook = sheets_v4.Schema$Spreadsheet;

export type WorkSheet = sheets_v4.Schema$Sheet;


export class GoogleSheet {
    #api: SheetsApi;
    #id: string;

    constructor(api: SheetsApi, id: string) {
        this.#api = api;
        this.#id = id;
    }

    static async open(email: string, key: string, id: string): Promise<GoogleSheet> {
        const client = await auth.getClient({
            credentials: {
                client_email: email,
                private_key: key
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/spreadsheets.readonly'
            ]
        });

        const api = sheets({ version: 'v4', auth: client });

        return new GoogleSheet(api, id);
    }

    get api(): SheetsApi { return this.#api; }

    get id(): string { return this.#id; }



    // Get
    async getSheetIds(): Promise<number[]> {
        const sheetList = await this.#api.spreadsheets.get({
            spreadsheetId: this.#id,
            fields: 'sheets.properties.sheetId'
        });

        const ids = sheetList.data.sheets?.map(sheet => sheet.properties?.sheetId).filter((id): id is number => id != null) ?? [];

        return ids;
    }

    // Modify
    async modify(...requests: SheetsApiRequest[]) {
        return await this.#api.spreadsheets.batchUpdate({
            spreadsheetId: this.#id,
            requestBody: {
                requests
            }
        });
    }

    async run(builder: SheetsRequestBuilder | ((builder: SheetsRequestBuilder) => SheetsRequestBuilder)) {
        if (typeof builder === 'function')
            builder = builder(new SheetsRequestBuilder());

        return builder.run(this);
    }


    async addSheet(id?: number, title?: string): Promise<number | undefined> {
        const result = await this.modify({
            addSheet: { properties: { sheetId: id, title } }
        });

        const resultId = result.data.replies?.[0]?.addSheet?.properties?.sheetId ?? undefined;

        return resultId;
    }

    async removeSheets(...ids: number[]) {
        return await this.modify(
            ...ids.map(id => ({ deleteSheet: { sheetId: id } }))
        );
    }

    async reset(): Promise<number> {
        const ids = await this.getSheetIds();

        const newId = Math.max(...ids, 999) + 1;

        await this.modify(
            { addSheet: { properties: { sheetId: newId, title: `Sheet: ${newId}` } } },
            ...ids.map(id => ({ deleteSheet: { sheetId: id } }))
        );

        return newId;
    }
}

export type SheetsReplyProcessor<Reply = SheetsApiReply> = (reply: Reply | undefined) => void;

export type SheetsApiResponse = sheets_v4.Schema$BatchUpdateSpreadsheetResponse;

export type SheetsApiReply = sheets_v4.Schema$Response;

export type SheetsApiAddSheetReply = sheets_v4.Schema$AddSheetResponse;

export type AddSheetOptions = {
    id?: number,
    title?: string,
    rows?: number,
    columns?: number;
    color?: Color;
};

export class SheetsRequestBuilder {
    #requests: SheetsApiRequest[];
    #processors: SheetsReplyProcessor[];

    constructor(requests: SheetsApiRequest[] = [], processors: SheetsReplyProcessor[] = []) {
        this.#requests = requests;
        this.#processors = processors;
    }

    do(request: SheetsApiRequest, process?: SheetsReplyProcessor) {
        return new SheetsRequestBuilder(
            [...this.#requests, request],
            [...this.#processors, process ?? (() => { })]
        );
    }

    #doBatch(requests: SheetsApiRequest[]) {
        return new SheetsRequestBuilder(
            [...this.#requests, ...requests],
            [...this.#processors, ...Array(requests.length).fill(() => { })]
        );
    }

    addSheet(options: AddSheetOptions, process?: SheetsReplyProcessor<SheetsApiAddSheetReply>) {
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

    async run(sheet: GoogleSheet) {
        const result = await sheet.modify(...this.#requests);

        const replies = result.data.replies ?? [];

        for (let i = 0; i < this.#processors.length; i++)
            this.#processors[i](replies[i]);

        return result;
    }
}