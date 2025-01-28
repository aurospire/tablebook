import { Result } from "../util";
import { TableColor, TableColumnType, TableNumericFormat, TableReference, TableStyle, TableTemporalFormat, TableTheme } from "./types";

export const isReference = (value: unknown): value is TableReference => typeof value === 'string' && value.startsWith('@');

export type TableReferenceResolver<T> = (name: string) => Result<T, string>;

export type TableDefinitionResolver = {
    colors?: TableReferenceResolver<TableColor>;
    styles?: TableReferenceResolver<TableStyle>;
    themes?: TableReferenceResolver<TableTheme>;
    numerics?: TableReferenceResolver<TableNumericFormat>;
    temporals?: TableReferenceResolver<TableTemporalFormat>;
    types?: TableReferenceResolver<TableColumnType>;
};