import { SheetContent } from "./SheetContent";
import { SheetType } from "./SheetKind";
import { SheetAlignment, SheetStyle } from "./SheetStyle";

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetType;
