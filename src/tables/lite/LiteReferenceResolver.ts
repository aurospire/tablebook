import { Result } from "../../util";
import { TableDefinitionResolver } from "../references";
import { TableNumericFormat, TableTemporalFormat } from "../types";
import { LiteLookupTypeStringRegex, LiteNumericTypeStringRegex, LiteTemporalTypeStringRegex } from "./lite";

export const temporalFormats: Record<string, TableTemporalFormat> = {
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


export const LiteReferenceResolver: TableDefinitionResolver = {
    types: (name) => {
        let match;

        if (name === 'text')
            return Result.success({ kind: 'text' });
        else if (match = name.match(LiteNumericTypeStringRegex)) {
            const [, type, decimals] = match;

            const format: TableNumericFormat | undefined = decimals ? {
                type: type as any,
                decimal: parseInt(decimals)!
            } : undefined;

            return Result.success({ kind: 'numeric', format });
        }
        else if (match = name.match(LiteTemporalTypeStringRegex)) {
            return Result.success({ kind: 'temporal', format: temporalFormats[name] });
        }
        else if (match = name.match(LiteLookupTypeStringRegex)) {
            const [, , page, group, column] = match;

            return Result.success({ kind: 'lookup', column: { page, group, name: column } });
        }

        else
            return Result.failure(`Type not found.`);
    },
    numerics: (name) => {
        const [match, type, decimals] = name.match(LiteNumericTypeStringRegex) ?? [];

        if (match)
            return Result.success({ type: type as any, decimal: decimals ? parseInt(decimals) : undefined });

        else
            return Result.failure(`Numeric format not found.`);
    },
    temporals: (name) => {
        const format = temporalFormats[name];

        if (format)
            return Result.success(temporalFormats[name]);

        else
            return Result.failure(`Temporal format not found.`);
    }
};
