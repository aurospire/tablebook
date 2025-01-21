import { SheetExpression } from "./SheetExpression";


export type SheetValue = string | number | boolean | SheetExpression;

export type SheetContent = { value?: SheetValue | null; };
