import { Result } from "../util";
import { TableColor, TableColumnType, TableHeaderStyle, TableNumericFormat, TableReference, TableReferenceMap, TableTemporalFormat, TableTheme } from "./types";

/** Checks if a value is a TableReference */
export const isReference = (value: unknown): value is TableReference => typeof value === 'string' && value.startsWith('@');

/** A function that resolves a table reference by name */
export type TableReferenceResolver<T> = (name: string) => Result<T, string>;

/** A lookup for table references, either a map or a resolver function */
export type TableReferenceLookup<T> = Record<string, T> | TableReferenceResolver<T>;

/** Defines resolvers for various table definitions */
export type TableDefinitionResolver = {
    colors?: TableReferenceLookup<TableColor>;
    styles?: TableReferenceLookup<TableHeaderStyle>;
    themes?: TableReferenceLookup<TableTheme>;
    numerics?: TableReferenceLookup<TableNumericFormat>;
    temporals?: TableReferenceLookup<TableTemporalFormat>;
    types?: TableReferenceLookup<TableColumnType>;
};