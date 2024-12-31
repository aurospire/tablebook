import { sheets_v4 } from "@googleapis/sheets";
import { ColorObject } from "../util/Color";


export type GoogleApi = sheets_v4.Sheets;

export type GoogleRequest = sheets_v4.Schema$Request;

export type GoogleResponse = sheets_v4.Schema$BatchUpdateSpreadsheetResponse;

export type GoogleReply = sheets_v4.Schema$Response;

export type GoogleAddSheetReply = sheets_v4.Schema$AddSheetResponse;

export type GoogleAddSheetOptions = {
    id?: number;
    title?: string;
    rows?: number;
    columns?: number;
    color?: ColorObject;
};
export type GoogleBorder = sheets_v4.Schema$Border;

export type GoogleColorStyle = sheets_v4.Schema$ColorStyle;

export type GoogleGridRange = sheets_v4.Schema$GridRange;


export type GoogleLogin = { email: string; key: string; };

export type GoogleSource = { api: GoogleApi; } | GoogleLogin;


export type GoogleCellValue = sheets_v4.Schema$ExtendedValue;

export type GoogleCellFormat = sheets_v4.Schema$CellFormat;

export type GoogleTextFormat = sheets_v4.Schema$TextFormat;

export type GoogleNumberFormat = sheets_v4.Schema$NumberFormat;

export type GoogleValidation = sheets_v4.Schema$DataValidationRule;

export type GoogleCondition = sheets_v4.Schema$BooleanCondition;