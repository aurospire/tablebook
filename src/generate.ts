import { TableBookIssue, TableBookParseIssue, TableBookResult, TableBookValidateIssue, TextLocation } from './issues';
import { processTableBook } from './process';
import { SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { parse, ParseError, printParseErrorCode, getLocation } from 'jsonc-parser';
import yaml, { LineCounter, parseDocument, YAMLParseError } from 'yaml';

export type TableBookSource =
    | { type: 'ts'; data: TableBook; }
    | { type: 'raw'; data: any; }
    | { type: 'json'; data: string; }
    | { type: 'yaml'; data: string; }
    | { type: 'fn'; data: () => TableBookResult<any, TableBookParseIssue>; }
    ;

const bruteForceLocation = (data: string, index: number): TextLocation => {
    const lines = data.slice(0, index).split('\n');

    return { index, line: lines.length, column: lines[lines.length - 1].length };
};

export const parseJson = (data: string): TableBookResult<any, TableBookParseIssue> => {
    const errors: ParseError[] = [];

    const result = parse(data, errors, { allowEmptyContent: false, allowTrailingComma: true, disallowComments: false });

    if (errors.length)
        return {
            success: false,
            issues: errors.map(error => {
                const location = getLocation(data, error.offset);

                return {
                    type: 'parsing',
                    message: printParseErrorCode(error.error),
                    location: bruteForceLocation(data, error.offset),
                    length: error.length
                };
            })
        };
    else
        return { success: true, data: result };
};

export const parseYaml = (data: string): TableBookResult<any, TableBookParseIssue> => {
    const result = parseDocument(data, { lineCounter: new LineCounter(), prettyErrors: true, logLevel: 'silent' });

    if (result.errors.length)
        return {
            success: false,
            issues: result.errors.map(error => {
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
            })
        };
    else
        return { success: true, data: result.toJS() };
};

export const validateData = (data: any): TableBookResult<TableBook, TableBookValidateIssue> => {
    const result = TableBookValidator.safeParse(data);

    if (result.success)
        return { success: true, data: result.data };
    else
        return { success: false, issues: result.error.issues.map(issue => ({ type: 'validating', message: issue.message, path: issue.path })) };
};

export const generate = async (source: TableBookSource, generator: SheetGenerator): Promise<TableBookResult<undefined, TableBookIssue>> => {
    // Parse
    let parseResult: TableBookResult<any, TableBookParseIssue>;

    switch (source.type) {
        case 'ts':
        case 'raw':
            parseResult = { success: true, data: source.data };
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
    const validateResult = validateData(parseResult.data);

    if (!validateResult.success)
        return validateResult;

    // Process
    const processResult = processTableBook(validateResult.data);

    if (!processResult.success)
        return processResult;

    // Generate
    const generateResult = await generator.generate(processResult.data);

    return generateResult;
};
