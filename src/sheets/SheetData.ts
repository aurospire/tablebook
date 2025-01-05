import { SheetExpression } from "./SheetExpression";
import { SheetKind } from "./SheetKind";
import { SheetStyle, SheetAlignment } from "./SheetStyle";


export type SheetValue = string | number | boolean | SheetExpression;

export type SheetContent = {
    value?: SheetValue | null;
};

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetKind;
