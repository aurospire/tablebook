import { TableBookGenerateIssue } from "../issues";
import { Result } from "../util";
import { SheetBook } from "./SheetBook";

export interface SheetGenerator {
    generate(book: SheetBook): Promise<Result<undefined, TableBookGenerateIssue[]>>;
}