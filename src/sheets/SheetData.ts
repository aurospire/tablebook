import { SheetContent } from "./SheetContent";
import { SheetType } from "./SheetType";
import { SheetAlignment, SheetStyle } from "./SheetStyle";

export type SheetData = SheetContent & SheetStyle & SheetAlignment & SheetType;
