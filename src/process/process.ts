import { TableBookPath, TableBookProcessIssue, TableBookResult } from "../issues";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "../sheets/SheetBook";
import { standardColors, standardThemes } from "../tables/palettes";
import { Reference, TableBook, TableColumn, TableGroup, TablePage, Theme } from "../tables/types";
import { resolveColumns } from "./resolveColumns";
import { resolveTheme } from "./resolveTheme";
import { resolveExpression } from "./resolveExpression";
import { resolveBehavior } from "./resolveBehavior";

export type ProcessLog = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};

export const processTableBook = (book: TableBook, logger?: ProcessLog): TableBookResult<SheetBook, TableBookProcessIssue> => {
    const issues: TableBookProcessIssue[] = [];

    logger?.book?.(book);

    const resultBook: SheetBook = {
        title: book.name,
        pages: []
    };

    const columnsResult = resolveColumns(book);

    if (columnsResult.success === false)
        issues.push(...columnsResult.issues);

    const columns = columnsResult.data!;

    // Reify definitions
    const colors = { ...(book.definitions?.colors ?? {}), ...standardColors };
    const styles = book.definitions?.styles ?? {};
    const themes = { ...(book.definitions?.themes ?? {}), ...standardThemes };
    const numeric = book.definitions?.formats?.numeric ?? {};
    const temporal = book.definitions?.formats?.temporal ?? {};
    const types = book.definitions?.types ?? {};


    for (let p = 0; p < book.pages.length; p++) {
        const pagePath: TableBookPath = ['pages', p];

        const page = book.pages[p]; logger?.page?.(page);

        const pageParents: (Theme | Reference)[] = book.theme ? [book.theme] : [];

        const pageTheme = resolveTheme(page.name, page.theme ?? {}, colors, styles, themes, pageParents);

        const resultPage: SheetPage = {
            title: page.name,
            tabColor: pageTheme.tab ?? undefined,
            rows: page.rows,
            groups: []
        };

        resultBook.pages.push(resultPage);

        for (let g = 0; g < page.groups.length; g++) {
            const groupPath: TableBookPath = [...pagePath, 'groups', g];

            const group = page.groups[g]; logger?.group?.(group);

            const groupParents = [...pageParents, ...(page.theme ? [page.theme] : [])];

            const groupTheme = resolveTheme(`${page.name}.${group.name}`, group.theme ?? {}, colors, styles, themes, groupParents);

            const resultGroup: SheetGroup = {
                title: group.name,
                titleStyle: groupTheme.group,
                columns: []
            };

            resultPage.groups.push(resultGroup);

            for (let c = 0; c < group.columns.length; c++) {
                const columnPath: TableBookPath = [...groupPath, 'columns', c];

                const column = group.columns[c]; logger?.column?.(column);

                const columnParents = [...groupParents, ...(group.theme ? [group.theme] : [])];

                const columnTheme = resolveTheme(`${page.name}.${group.name}.${column.name}`, column.theme ?? {}, colors, styles, themes, columnParents);

                const formula = column.expression ? resolveExpression(column.expression, page.name, group.name, column.name, columns) : undefined;

                const behavior = resolveBehavior(column.type, page.name, group.name, column.name, columns, colors, styles, numeric, temporal);

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.header,
                    dataStyle: columnTheme.data,
                    formula,
                    behavior
                };

                resultGroup.columns.push(resultColumn);
            }
        }
    };

    return { success: true, data: resultBook };
};
