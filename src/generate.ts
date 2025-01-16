import { getLocation, parse, ParseError, printParseErrorCode } from 'jsonc-parser';
import { LineCounter, parseDocument } from 'yaml';
import { TableBookIssue, TableBookParseIssue, TableBookValidateIssue } from './issues';
import { processTableBook } from './process';
import { SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { Result, TextLocation } from './util';

export type TableBookSource =
    | { type: 'ts'; data: TableBook; }
    | { type: 'raw'; data: any; }
    | { type: 'json'; data: string; }
    | { type: 'yaml'; data: string; }
    | { type: 'fn'; data: () => Result<any, TableBookParseIssue[]>; }
    ;

export type TableBookParseResult = Result<any, TableBookParseIssue[]>;
export type TableBookValidateResult = Result<any, TableBookValidateIssue[]>;

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

export const validateData = (data: any): TableBookValidateResult => {
    const result = TableBookValidator.safeParse(data);

    return result.success
        ? Result.success(result.data)
        : Result.failure(result.error.issues.map(issue => ({ type: 'validating', message: issue.message, path: issue.path })));
};

export const generate = async (source: TableBookSource, generator: SheetGenerator): Promise<Result<undefined, TableBookIssue[]>> => {
    // Parse
    let parseResult: TableBookParseResult;

    switch (source.type) {
        case 'ts':
        case 'raw':
            parseResult = Result.success(source.data);
            break;
        case 'json':
            parseResult = parseJson(source.data);
            break;
        case 'yaml':
            parseResult = parseYaml(source.data);
            break;
        case 'fn':
            parseResult = source.data();
            break;
    }

    if (!parseResult.success)
        return parseResult;

    // Validate
    const validateResult = validateData(parseResult.value);

    if (!validateResult.success)
        return validateResult;

    // Process
    const processResult = processTableBook(validateResult.value);

    if (!processResult.success)
        return processResult;

    // Generate
    return await generator.generate(processResult.data);
};
