import { TableBookIssue, TableBookParseIssue, TableBookResult, TableBookValidateIssue } from './issues';
import { SheetGenerator } from './sheets';
import { TableBook } from './tables/types';

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
    throw new Error();
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

    return { success: true, data: undefined };
};
