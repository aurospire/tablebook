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
    /** Lookup for table colors */
    colors?: TableReferenceLookup<TableColor>;
    /** Lookup for table header styles */
    styles?: TableReferenceLookup<TableHeaderStyle>;
    /** Lookup for table themes */
    themes?: TableReferenceLookup<TableTheme>;
    /** Lookup for table numeric formats */
    numerics?: TableReferenceLookup<TableNumericFormat>;
    /** Lookup for table temporal formats */
    temporals?: TableReferenceLookup<TableTemporalFormat>;
    /** Lookup for table column types */
    types?: TableReferenceLookup<TableColumnType>;
};