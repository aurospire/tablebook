import { SheetRange } from "../sheets/SheetPosition";
import { GoogleGridRange } from "./GoogleTypes";

export const toGridRange = (sheetId: number, range: SheetRange): GoogleGridRange => ({
    sheetId,
    startColumnIndex: range.from.col,
    endColumnIndex: range.to ? range.to.col === undefined ? undefined : range.to.col + 1 : range.from.col + 1,
    startRowIndex: range.from.row,
    endRowIndex: range.to ? range.to.row === undefined ? undefined : range.to.row + 1 : range.from.row + 1,
});
