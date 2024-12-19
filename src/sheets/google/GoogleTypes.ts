import { sheets_v4 } from "@googleapis/sheets";


export type GoogleApi = sheets_v4.Sheets;

export type GoogleRequest = sheets_v4.Schema$Request;

export type GoogleResponse = sheets_v4.Schema$BatchUpdateSpreadsheetResponse;

export type GoogleReply = sheets_v4.Schema$Response;

export type GoogleAddSheetReply = sheets_v4.Schema$AddSheetResponse;


export type GoogleLogin = { email: string; key: string; };

export type GoogleSource = { api: GoogleApi; } | GoogleLogin;


export type GoogleCellValue = sheets_v4.Schema$ExtendedValue;

export type GoogleCellFormat = sheets_v4.Schema$CellFormat;

export type GoogleTextFormat = sheets_v4.Schema$TextFormat;

export type GoogleNumberFormat = sheets_v4.Schema$NumberFormat;