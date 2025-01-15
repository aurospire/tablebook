import { TableBookGenerateIssue, TableBookResult } from "../issues";
import { SheetBook } from "./SheetBook";

export interface SheetGenerator {
    generate(book: SheetBook): Promise<TableBookResult<undefined, TableBookGenerateIssue>>;
}