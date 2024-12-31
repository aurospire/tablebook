import { SheetRange } from "../sheets/SheetPosition";
import { GoogleGridRange } from "./GoogleTypes";

export const toGridRange = (sheetId: number, range: SheetRange): GoogleGridRange => ({
    sheetId,
    startColumnIndex: range.start.col,
    endColumnIndex: range.end ? range.end.col : range.start.col + 1,
    startRowIndex: range.start.row,
    endRowIndex: range.end ? range.end.row : range.start.row + 1,
});
