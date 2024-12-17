import { auth, sheets } from '@googleapis/sheets';
import { SheetsApi } from './SheetsTypes';
import { SheetsAddSheetOptions, SheetsRequester } from './SheetsRequester';

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
    async modify(requester: SheetsRequester | ((requester: SheetsRequester) => SheetsRequester)) {
        if (typeof requester === 'function')
            requester = requester(new SheetsRequester());

        return await requester.run(this.#api, this.#id);
    }

    async setTitle(title: string): Promise<void> {
        await this.modify(r => r.do({
            updateSpreadsheetProperties: {
                properties: { title },
                fields: 'title',
            }
        }));
    }

    async addSheet(options: SheetsAddSheetOptions = {}): Promise<number | undefined> {
        let resultId: number | undefined;

        await this.modify(r => r.addSheet(options, reply => resultId = reply?.properties?.sheetId ?? undefined));

        return resultId;
    }

    async dropSheets(...ids: number[]): Promise<void> {
        await this.modify(r => r.dropSheets(ids));
    }

    async reset(): Promise<number> {
        const ids = await this.getSheetIds();

        const newId = Math.max(...ids, 999) + 1;

        await this.modify(
            r => r
                .addSheet({ id: newId, title: `Sheet: ${newId}` })
                .dropSheets(ids)
        );

        return newId;
    }
}

