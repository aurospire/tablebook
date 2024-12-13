export interface SpreadsheetGenerator {
    open(): void;

    close(): void;
}

export class GoogleSheetGenerator implements SpreadsheetGenerator {
    open(): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        throw new Error("Method not implemented.");
    }

}

export class ExcelJsGenerator implements SpreadsheetGenerator {
    open(): void {
        throw new Error("Method not implemented.");
    }
    close(): void {
        throw new Error("Method not implemented.");
    }

}