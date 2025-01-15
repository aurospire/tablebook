import { TableBookIssue, TableBookParseIssue, TableBookResult, TableBookValidateIssue } from './issues';
import { processTableBook } from './process';
import { SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';

export type TableBookSource =
    | { type: 'ts'; data: TableBook; }
    | { type: 'raw'; data: any; }
    | { type: 'json'; data: string; }
    | { type: 'yaml'; data: string; }
    | { type: 'fn'; data: () => TableBookResult<any, TableBookParseIssue>; }
    ;

export const parseJson = (data: string): TableBookResult<any, TableBookParseIssue> => {
    throw new Error();
};

export const parseYaml = (data: string): TableBookResult<any, TableBookParseIssue> => {
    throw new Error();
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

    return generateResult
};
