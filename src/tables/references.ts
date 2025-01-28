import { Result } from "../util";
import { TableColor, TableColumnType, TableNumericFormat, TableReference, TableStyle, TableTemporalFormat, TableTheme } from "./types";

export const isReference = (value: unknown): value is TableReference => typeof value === 'string' && value.startsWith('@');

export type ReferenceResolver<T> = (name: string) => Result<T, string>;

export type ReferenceResolvers = {
    colors?: ReferenceResolver<TableColor>;
    styles?: ReferenceResolver<TableStyle>;
    themes?: ReferenceResolver<TableTheme>;
    numerics?: ReferenceResolver<TableNumericFormat>;
    temporals?: ReferenceResolver<TableTemporalFormat>;
    types?: ReferenceResolver<TableColumnType>;
};