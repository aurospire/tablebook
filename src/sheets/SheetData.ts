import { SheetExpression } from "./SheetExpression";
import { SheetType } from "./SheetKind";
import { SheetAlignment, SheetStyle } from "./SheetStyle";


export type SheetValue = string | number | boolean | SheetExpression;

export type SheetContent = {
    value?: SheetValue | null;
};

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetType;
