import { TableBookProcessIssue } from "../issues";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "../sheets/SheetBook";
import { TableDefinitionResolver } from "../tables";
import { TableBook, TableColumn, TableGroup, TablePage, TableReference, TableTheme } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { TableDefinitionsManager, TableReferenceRegistry } from "./DefinitionsRegistry";
import { resolveBehavior } from "./resolveBehavior";
import { resolveColumns } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { resolveTheme } from "./resolveTheme";


export type TableProcessLogger = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};

export const processTableBook = (book: TableBook, resolvers?: TableDefinitionResolver[], logger?: TableProcessLogger): Result<SheetBook, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    logger?.book?.(book);

    const resultBook: SheetBook = {
        title: book.name,
        pages: []
    };

    const columnsResult = resolveColumns(book);

    if (columnsResult.success === false)
        issues.push(...columnsResult.info);

    const columns = columnsResult.value!;

    // Reify definitions
    const bookDefinitions = TableDefinitionsManager.new(book.definitions, resolvers);


    for (let p = 0; p < book.pages.length; p++) {
        const pagePath: ObjectPath = ['pages', p];

        const page = book.pages[p]; logger?.page?.(page);

        const pageDefinitions = bookDefinitions.overlay(page.definitions);

        const pageParents: (TableTheme | TableReference)[] = book.theme ? [book.theme] : [];

        const pageTheme = resolveTheme(page.theme ?? {}, pageDefinitions, pageParents, [], pagePath);

        if (!pageTheme.success)
            issues.push(...pageTheme.info);

        const resultPage: SheetPage = {
            title: page.name,
            tabColor: pageTheme.value!.tab ?? undefined,
            rows: page.rows,
            groups: []
        };

        resultBook.pages.push(resultPage);

        for (let g = 0; g < page.groups.length; g++) {
            const groupPath: ObjectPath = [...pagePath, 'groups', g];

            const group = page.groups[g]; logger?.group?.(group);

            const groupDefinitions = pageDefinitions.overlay(group.definitions);

            const groupParents = [...pageParents, ...(page.theme ? [page.theme] : [])];

            const groupTheme = resolveTheme(group.theme ?? {}, groupDefinitions, groupParents, [], groupPath);

            if (!groupTheme.success)
                issues.push(...groupTheme.info);

            const resultGroup: SheetGroup = {
                title: group.name,
                titleStyle: groupTheme.value!.group,
                columns: []
            };

            resultPage.groups.push(resultGroup);

            for (let c = 0; c < group.columns.length; c++) {
                const columnPath: ObjectPath = [...groupPath, 'columns', c];

                const column = group.columns[c]; logger?.column?.(column);

                const columnDefinitions = groupDefinitions.overlay(column.definitions);

                const columnParents = [...groupParents, ...(group.theme ? [group.theme] : [])];

                const columnTheme = resolveTheme(column.theme ?? {}, columnDefinitions, columnParents, [], columnPath);
                if (!columnTheme.success)
                    issues.push(...columnTheme.info);

                let formula;

                if (column.expression) {
                    const result = resolveExpression(column.expression, page.name, group.name, column.name, columns, columnPath);

                    if (!result.success)
                        issues.push(...result.info);
                    else
                        formula = result.value;
                }

                let behavior;
                if (column.type !== undefined) {
                    const result = resolveBehavior(column.type, page.name, group.name, column.name, columns, columnDefinitions, columnPath);

                    if (!result.success)
                        issues.push(...result.info);
                    else
                        behavior = result.value;
                }

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.value!.header,
                    dataStyle: columnTheme.value!.data,
                    expression: formula,
                    behavior
                };

                resultGroup.columns.push(resultColumn);
            }
        }
    };

    return issues.length === 0
        ? Result.success(resultBook)
        : Result.failure(issues, resultBook);
};
