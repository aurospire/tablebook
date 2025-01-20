import { getLocation, parse, ParseError, printParseErrorCode } from 'jsonc-parser';
import { LineCounter, parseDocument } from 'yaml';
import { FlatBook, FlatBookValidator, processFlatBook } from './flat';
import { TableBookIssue, TableBookParseIssue, TableBookProcessIssue, TableBookValidateIssue } from './issues';
import { processTableBook } from './process';
import { SheetBook, SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { Result, TextLocation } from './util';

export type TableBookSource =
    | { type: 'ts'; data: TableBook; }
    | { type: 'raw'; data: any; }
    | { type: 'json'; data: string; of: 'flat' | 'table'; }
    | { type: 'yaml'; data: string; of: 'flat' | 'table'; }
    ;

export type TableBookParseResult = Result<any, TableBookParseIssue[]>;
export type TableBookValidateResult<T> = Result<T, TableBookValidateIssue[]>;

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


export const tablebook = Object.freeze({
    parse(format: 'json' | 'yaml', data: string): TableBookParseResult {
        return format === 'json'
            ? parseJson(data)
            : parseYaml(data);
    },

    validate<F extends 'flat' | 'table'>(format: F, data: any): TableBookValidateResult<F extends 'flat' ? FlatBook : TableBook> {
        const validator = format === 'flat'
            ? TableBookValidator
            : FlatBookValidator;

        const result = validator.safeParse(data);

        return result.success
            ? Result.success(result.data) as any
            : Result.failure(result.error.issues.map(issue => ({ type: 'validating', message: issue.message, path: issue.path })));
    },

    convert<F extends 'flat' | 'table'>(format: F, data: F extends 'flat' ? FlatBook : TableBook): Result<F extends 'flat' ? TableBook : SheetBook, TableBookProcessIssue[]> {
        return format === 'flat'
            ? processFlatBook(data as any)
            : processTableBook(data as any) as any;
    },

    async generate(data: SheetBook, generator: SheetGenerator): Promise<Result<undefined, TableBookIssue[]>> {
        return await generator.generate(data);
    }
});