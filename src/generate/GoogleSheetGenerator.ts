import { SheetBorderConfig, SheetColumnConfig, SheetStyle, SpreadsheetGenerator } from "./SpreadsheetGenerator";

import { google, sheets_v4 } from 'googleapis';

type SheetsApi = sheets_v4.Sheets;

type Spreadsheet = sheets_v4.Schema$Spreadsheet;

type Worksheet = sheets_v4.Schema$Sheet;

export class GoogleSheetGenerator implements SpreadsheetGenerator {
    #api: SheetsApi;
    #id: string;

    constructor(api: SheetsApi, id: string) {
        this.#api = api;
        this.#id = id;
    }

    async prepare(): Promise<void> {

    }

    async setTitle(name: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addSheet(name: string, rows: number, columns: number): Promise<number> {
        throw new Error("Method not implemented.");
    }

    async addGroup(sheet: number, name: string, columnStart: number, columnCount: number, style?: SheetStyle, borders?: SheetBorderConfig): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async addColumn(sheet: number, name: string, columnIndex: number, config: SheetColumnConfig): Promise<void> {
        throw new Error("Method not implemented.");
    }

    static async login({ email, key }: { email: string, key: string; }): Promise<SheetsApi> {
        const client = await google.auth.getClient({
            credentials: {
                client_email: email,
                private_key: key
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/spreadsheets.readonly'
            ]
        });

        const api = google.sheets({ version: 'v4', auth: client });


        return api;
    }

    static async create({ email, key, id }: { email: string, key: string, id: string; }): Promise<GoogleSheetGenerator> {
        const api = await this.login({ email, key });

        const generator = new GoogleSheetGenerator(api, id);

        await generator.prepare();

        return generator;
    }
}