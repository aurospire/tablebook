import { TableBookProcessIssue } from "../issues";
import { SheetBehavior, SheetStyle } from "../sheets";
import { SheetBook, SheetColumn, SheetColumnList, SheetGroup, SheetPage, SheetValues } from "../sheets/SheetBook";
import { isReference, TableDefinitionResolver } from "../tables";
import { TableBook, TableColumn, TableColumnList, TableDataType, TableGroup, TablePage } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { TableDefinitionsManager } from "./DefinitionsRegistry";
import { resolveBehavior } from "./resolveBehavior";
import { resolveColumns, ResolvedColumnMap, toLookupName } from "./resolveColumns";
import { resolveStyle } from "./resolveStyle";
import { mergeStyles, resolveTheme, SheetTheme } from "./resolveTheme";
import { resolveValues } from "./resolveValues";

export type TableProcessLogger = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};

export const resolveColumn = (
    column: TableColumn,
    pageName: string, groupName: string | undefined, dataRows: number,
    path: ObjectPath,
    definitions: TableDefinitionsManager,
    columns: ResolvedColumnMap,
    parentThemes: SheetTheme[],
    logger: TableProcessLogger | undefined,
    issues: TableBookProcessIssue[]
): SheetColumn | undefined => {
    logger?.column?.(column);

    definitions = definitions.overlay(column.definitions);

    const theme = resolveTheme(column.theme ?? {}, definitions, parentThemes, [], path, issues);

    const values: SheetValues | undefined = column.values
        ? resolveValues(column.values, pageName, groupName, column.name, columns, path, issues)
        : undefined;

    if ((values?.items?.length ?? 0) > dataRows)
        issues.push({ type: 'processing', message: 'Values contain more items than available rows', data: values?.items?.length ?? 0, path });


    let behavior: SheetBehavior | undefined;

    let typeStyle: SheetStyle | undefined;

    const typeResult: TableDataType | undefined = isReference(column.type)
        ? Result.unwrap(definitions.types.resolve(column.type, path), (info): undefined => { issues.push(...info); })
        : column.type;

    if (typeResult) {
        if (typeResult.style)
            typeStyle = resolveStyle(typeResult.style, definitions, path, issues);

        behavior = resolveBehavior(typeResult, pageName, groupName, column.name, columns, definitions, path, issues);
    }

    const result: SheetColumn = {
        title: column.name,
        titleStyle: theme.header,
        dataStyle: typeStyle ? mergeStyles(theme.data, typeStyle, false) : theme.data,
        values,
        behavior
    };

    return result;
};

export const resolveColumnList = (
    list: TableColumnList,
    pageName: string, dataRows: number,
    path: ObjectPath,
    definitions: TableDefinitionsManager,
    columns: ResolvedColumnMap,
    themeParents: SheetTheme[],
    logger: TableProcessLogger | undefined,
    issues: TableBookProcessIssue[]
): SheetColumnList | undefined => {
    const resultColumns = list.columns
        .map((column, i) => resolveColumn(column, pageName, undefined, dataRows, [...path, 'columns', i], definitions, columns, themeParents, logger, issues))
        .filter((column): column is SheetColumn => column !== undefined);

    const result: SheetColumnList = {
        columns: resultColumns
    };

    return result;
};

export const resolveGroup = (
    group: TableGroup,
    pageName: string,
    path: ObjectPath, dataRows: number,
    definitions: TableDefinitionsManager,
    columns: ResolvedColumnMap,
    themeParents: SheetTheme[],
    logger: TableProcessLogger | undefined,
    issues: TableBookProcessIssue[]
): SheetGroup | undefined => {

    logger?.group?.(group);

    definitions = definitions.overlay(group.definitions);

    const theme = resolveTheme(group.theme ?? {}, definitions, themeParents, [], path, issues);

    themeParents = [...themeParents, theme];

    const resolvedColumns = group.columns
        .map((column, i) => resolveColumn(column, pageName, undefined, dataRows, [...path, 'columns', i], definitions, columns, themeParents, logger, issues))
        .filter((column): column is SheetColumn => column !== undefined);

    const result: SheetGroup = {
        title: group.name,
        titleStyle: theme?.group ?? {},
        columns: resolvedColumns,
    };

    return result;
};

export const resolvePage = (
    page: TablePage,
    path: ObjectPath,
    definitions: TableDefinitionsManager,
    columns: ResolvedColumnMap,
    themeParents: SheetTheme[],
    logger: TableProcessLogger | undefined,
    issues: TableBookProcessIssue[]
): SheetPage | undefined => {
    logger?.page?.(page);

    definitions = definitions.overlay(page.definitions);

    const theme = resolveTheme(page.theme ?? {}, definitions, themeParents, [], path, issues);

    themeParents = [...themeParents, theme];

    const schema: SheetPage['schema'] | undefined = Array.isArray(page.schema)
        ? page.schema
            .map((list, i) => resolveGroup(list, page.name, [...path, 'schema', i], page.rows, definitions, columns, themeParents, logger, issues))
            .filter((list): list is SheetGroup => list !== undefined)
        : resolveColumnList(page.schema, page.name, page.rows, [...path, 'schema'], definitions, columns, themeParents, logger, issues);


    if (schema) {
        const result: SheetPage = {
            title: page.name,
            tabColor: theme?.tab ?? undefined,
            schema,
            rows: page.rows
        };

        return result;
    }
};

export const processTableBook = (
    book: TableBook,
    resolvers?: TableDefinitionResolver[],
    logger?: TableProcessLogger
): Result<SheetBook, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    logger?.book?.(book);

    const columns = resolveColumns(book, issues);

    const definitions = TableDefinitionsManager.new(book.definitions, resolvers);

    const theme = resolveTheme(book.theme ?? {}, definitions, [], [], [], issues);

    const pages = book.pages
        .map((page, i) => resolvePage(page, ['pages', i], definitions, columns, [theme], logger, issues))
        .filter((page): page is SheetPage => page !== undefined);

    const result: SheetBook = { title: book.name, pages };

    return issues.length === 0
        ? Result.success(result)
        : Result.failure(issues, result);
};
