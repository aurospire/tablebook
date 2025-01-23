import { TableBookProcessIssue } from "../issues";
import { MissingReferenceResolvers } from "../process";
import { Result } from "../util";
import { TableColumnType, TableNumberFormat, TableNumericFormat, TableNumericType, TableTemporalFormat, TableTextType } from "./types";

export type LiteTableReference<T extends string = string> = `@${T}`;

export type LiteTableColumnSelector = { page?: string; group?: string; name: string; };

export type LiteTableUnitSelector = `${'$' | '+' | '-'}${number}`;

export type LiteTableRowSelector = LiteTableUnitSelector | { from: LiteTableUnitSelector, to: LiteTableUnitSelector; } | 'all';

export type LiteTableSelector = {
    column: LiteTableColumnSelector | 'self';
    rows: LiteTableRowSelector | 'self';
} | 'self';

export type LiteTableColor = `#${string}`;

export type LiteTablePalette =
    'pink' | 'cranberry' | 'red' | 'rust' | 'orange' | 'yellow' |
    'green' | 'moss' | 'sage' | 'teal' | 'slate' | 'cyan' | 'blue' | 'azure' | 'skyblue' |
    'lavender' | 'indigo' | 'purple' | 'plum' | 'mauve' | 'coral' | 'terracotta' | 'bronze' |
    'sand' | 'taupe' | 'gray' | 'charcoal';

export type LiteTableLiteralExpression = { type: 'literal', of: string | number | boolean; };

export type LiteTableRawExpression = { type: 'raw', text: string, refs?: Record<string, LiteTableSelector>; };

export type LiteTableExpression = | LiteTableRawExpression | LiteTableLiteralExpression;


export type LiteTableTextTypeString = 'text';

export type LiteTableNumericTypeString = `('currency' | 'number' | 'percent')${`:${number}` | ''}`;
export const LiteTableNumericTypeStringRegex = /^(currency|number|percent)(?::([0-9]+))?$/;

export type LiteTableTemporalTypeString = `${'date' | 'datetime'}${`:${'iso' | 'text'}` | ''}`;
export const LiteTableTemporalTypeStringRegex = /^(date|datetime)(:(iso|text)|)$/;

export type LiteTableLookupTypeString = `lookup:${string}.${string}.${string}`;
export const LiteTableLookupTypeStringRegex = /^(lookup):([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)$/;


export type LiteTableTextType = LiteTableReference<LiteTableTextTypeString> | { kind: 'text'; };

export type LiteTableEnumItem = { name: string; description?: string; color: LiteTableColor; };

export type LiteTableEnumType = { kind: 'enum'; items: LiteTableEnumItem[]; };

export type LiteTableLookupType = LiteTableReference<LiteTableLookupTypeString> | { kind: 'lookup'; column: LiteTableColumnSelector; };

export type LiteTableNumericType = LiteTableReference<LiteTableNumericTypeString> | { kind: 'numeric'; format?: LiteTableReference<LiteTableNumericTypeString>; };

export type LiteTableTemporalType = LiteTableReference<LiteTableTemporalTypeString> | { kind: 'temporal'; format?: LiteTableReference<LiteTableTemporalTypeString>; };

export type LiteTableColumnType = LiteTableTextType | LiteTableEnumType | LiteTableLookupType | LiteTableNumericType | LiteTableTemporalType;


export type LiteTableUnit = { name: string; description?: string; };

export type LiteTableColumn = LiteTableUnit & { type: LiteTableColumnType | LiteTableReference; source?: string; expression?: LiteTableExpression; };

export type LiteTableGroup = LiteTableUnit & { columns: LiteTableColumn[]; };

export type LiteTablePage = LiteTableUnit & { groups: LiteTableGroup[]; rows: number; theme: LiteTableReference<LiteTablePalette>; };

export type LiteTableDefinitions = { types?: Record<string, LiteTableColumnType>; };

export type LiteTableBook = LiteTableUnit & { pages: LiteTablePage[]; definitions?: LiteTableDefinitions; };


const temporalFormats: Record<string, TableTemporalFormat> = {
    // MM/DD/YYYY
    'date': [
        { type: 'month', length: 'long' },
        '/',
        { type: 'day', length: 'long' },
        '/',
        { type: 'year', length: 'long' },
    ],
    // MM/DD/YYYY HH:MM:SS AM/PM
    'datetime': [
        { type: 'month', length: 'long' },
        '/',
        { type: 'day', length: 'long' },
        '/',
        { type: 'year', length: 'long' },
        ' ',
        { type: 'hour', length: 'long' },
        ':',
        { type: 'minute', length: 'long' },
        ':',
        { type: 'second', length: 'long' },
        ' ',
        { type: 'meridiem', length: 'short' },
    ],

    // YYYY-MM-DD
    'date:iso': [
        { type: 'year', length: 'long' },
        '-',
        { type: 'month', length: 'long' },
        '-',
        { type: 'day', length: 'long' },
    ],
    // YYYY-MM-DDTHH:MM:SS
    'datetime:iso': [
        { type: 'year', length: 'long' },
        '-',
        { type: 'month', length: 'long' },
        '-',
        { type: 'day', length: 'long' },
        'T',
        { type: 'hour', length: 'long' },
        ':',
        { type: 'minute', length: 'long' },
        ':',
        { type: 'second', length: 'long' },
    ],

    // Sun, Jan 1, 2023
    'date:text': [
        { type: 'weekday', length: 'short' },
        ', ',
        { type: 'month', length: 'long' },
        ' ',
        { type: 'day', length: 'long' },
        ', ',
        { type: 'year', length: 'long' },
    ],

    // Sun, Jan 1, 2023 12:00:00 AM
    'datetime:text': [
        { type: 'weekday', length: 'short' },
        ', ',
        { type: 'month', length: 'long' },
        ' ',
        { type: 'day', length: 'long' },
        ', ',
        { type: 'year', length: 'long' },
        ' ',
        { type: 'hour', length: 'long' },
        ':',
        { type: 'minute', length: 'long' },
        ':',
        { type: 'second', length: 'long' },
        ' ',
        { type: 'meridiem', length: 'short' },
    ],
};

export const LiteTableReferenceResolver: MissingReferenceResolvers = {
    types: (name, path) => {
        let match;

        if (name === 'text')
            return Result.success({ kind: 'text' });
        else if (match = name.match(LiteTableNumericTypeStringRegex)) {
            const [, type, decimals] = match;

            const format: TableNumericFormat | undefined = decimals ? {
                type: type as any,
                decimal: parseInt(decimals)!
            } : undefined;

            return Result.success({ kind: 'numeric', format });
        }
        else if (match = name.match(LiteTableTemporalTypeStringRegex)) {
            return Result.success({ kind: 'temporal', format: temporalFormats[name] });
        }
        else if (match = name.match(LiteTableLookupTypeStringRegex)) {
            const [, , page, group, column] = match;

            return Result.success({ kind: 'lookup', column: { page, group, name: column } });
        }
        else
            return Result.failure([{ type: 'processing', message: `Type not found.`, path, data: name }]);
    },
    format: {
        numerics: (name, path) => {
            const [match, type, decimals] = name.match(LiteTableNumericTypeStringRegex) ?? [];

            if (match)
                return Result.success({ type: type as any, decimal: decimals ? parseInt(decimals) : undefined });
            else
                return Result.failure([{ type: 'processing', message: `Numeric format not found.`, path, data: name }]);
        },
        temporal: (name, path) => {
            const format = temporalFormats[name];

            if (format)
                return Result.success(temporalFormats[name]);
            else
                return Result.failure([{ type: 'processing', message: `Temporal format not found.`, path, data: name }]);
        }
    },
};