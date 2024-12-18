import { sheets_v4 } from "@googleapis/sheets";


export type SheetsApi = sheets_v4.Sheets;

export type SheetsRequest = sheets_v4.Schema$Request;

export type SheetsResponse = sheets_v4.Schema$BatchUpdateSpreadsheetResponse;

export type SheetsReply = sheets_v4.Schema$Response;

export type SheetsAddSheetReply = sheets_v4.Schema$AddSheetResponse;


export type SheetsLogin = { email: string; key: string; };

export type SheetsSource = { api: SheetsApi; } | SheetsLogin;
