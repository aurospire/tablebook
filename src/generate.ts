import { getLocation, parse, ParseError, printParseErrorCode } from 'jsonc-parser';
import { LineCounter, parseDocument } from 'yaml';
import { FlatBook, FlatBookValidator, NameMaker, processFlatBook } from './flat';
import { TableBookGenerateIssue, TableBookIssue, TableBookParseIssue, TableBookProcessIssue, TableBookValidateIssue } from './issues';
import { processTableBook } from './process';
import { SheetBook, SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { ObjectPath, Result, TextLocation } from './util';
import { ZodIssue } from 'zod';


export type TableBookParseResult = Result<any, TableBookParseIssue[]>;
export type TableBookValidateResult<T> = Result<T, TableBookValidateIssue[]>;
export type TableBookProcessResult<T> = Result<T, TableBookProcessIssue[]>;
export type TableBookGenerateResult = Result<undefined, TableBookGenerateIssue[]>;

const bruteForceLocation = (data: string, index: number): TextLocation => {
    const lines = data.slice(0, index).split('\n');

    return { index, line: lines.length, column: lines[lines.length - 1].length };
};

export const parseJson = (data: string): TableBookParseResult => {
    const errors: ParseError[] = [];

    const result = parse(data, errors, { allowEmptyContent: false, allowTrailingComma: true, disallowComments: false });

    return (errors.length === 0)
        ? Result.success(result)
        : Result.failure(errors.map(error => {
            const location = getLocation(data, error.offset);

            return {
                type: 'parsing',
                message: printParseErrorCode(error.error),
                location: bruteForceLocation(data, error.offset),
                length: error.length
            };
        }));
};

export const parseYaml = (data: string): TableBookParseResult => {
    const result = parseDocument(data, { lineCounter: new LineCounter(), prettyErrors: true, logLevel: 'silent' });

    return (result.errors.length === 0)
        ? Result.success(result.toJS())
        : Result.failure(result.errors.map(error => {
            const start = error.pos[0];
            const end = error.pos[1];
            const length = end - start;

            return {
                type: 'parsing',
                message: error.message,
                location: {
                    index: start,
                    line: error.linePos?.[0].line ?? -1,
                    column: error.linePos?.[0].col ?? -1,
                },
                length
            };
        }));
};

const getData = (data: any, path: ObjectPath): any => {
    let value = data;

    for (const key of path) {
        if (value === undefined)
            return undefined;

        value = value?.[key];
    }

    return value;
};

const mapValidatorIssue = (issue: ZodIssue, data: any): TableBookValidateIssue => {
    return {
        type: 'validating',
        message: issue.message,
        path: issue.path,
        value: getData(data, issue.path)
    };
};

export const tablebook = Object.freeze({
    flat: Object.freeze({
        validate: (data: any): TableBookValidateResult<FlatBook> => {
            const result = FlatBookValidator.safeParse(data);

            return result.success
                ? Result.success(result.data)
                : Result.failure(result.error.issues.map(issue => mapValidatorIssue(issue, data)));
        },
        convert(data: FlatBook, makeName?: NameMaker): TableBookProcessResult<TableBook> {
            return processFlatBook(data, makeName);
        }
    }),

    parse(format: 'json' | 'yaml', data: string): TableBookParseResult {
        return format === 'json'
            ? parseJson(data)
            : parseYaml(data);
    },

    validate(data: any): TableBookValidateResult<TableBook> {
        const result = TableBookValidator.safeParse(data);

        return result.success
            ? Result.success(result.data)
            : Result.failure(result.error.issues.map(issue => mapValidatorIssue(issue, data)));
    },

    convert(data: TableBook): TableBookProcessResult<SheetBook> {
        return processTableBook(data);
    },

    async generate(data: SheetBook, generator: SheetGenerator): Promise<TableBookGenerateResult> {
        return await generator.generate(data);
    }
});

