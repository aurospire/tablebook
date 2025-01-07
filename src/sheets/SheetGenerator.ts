import { SheetBook } from "./SheetBook";

export interface SheetGenerator {
    generate(book: SheetBook): Promise<void>;
}