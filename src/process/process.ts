import { TableBookProcessIssue } from "../issues";
import { StandardPalettes } from "../palettes";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "../sheets/SheetBook";
import { TableReference, TableBook, TableColumn, TableGroup, TablePage, TableTheme } from "../tables/types";
import { ColorHex, ObjectPath, Result } from "../util";
import { resolveBehavior } from "./resolveBehavior";
import { resolveColumns } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { resolveTheme } from "./resolveTheme";

/**
 * Main color reference for each palette.
 * Maps palette names to their `main` color.
 */
export const standardColors: Record<string, ColorHex> = Object.fromEntries(
    Object.entries(StandardPalettes).map(([key, palette]) => [key, palette.main])
);

/**
 * Standard themes derived from predefined palettes.
 * Maps palette colors to `tab`, `group`, `header`, and `data` styling.
 */
export const standardThemes: Record<string, TableTheme> = Object.fromEntries(
    Object.entries(StandardPalettes).map(([key, palette]) => [key, {
        tab: palette.main,
        group: { back: palette.darkest },
        header: { back: palette.dark },
        data: { back: palette.lightest },
    }])
);

export type ProcessLog = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};

export const processTableBook = (book: TableBook, logger?: ProcessLog): Result<SheetBook, TableBookProcessIssue[]> => {
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
    const colors = { ...(book.definitions?.colors ?? {}), ...standardColors };
    const styles = book.definitions?.styles ?? {};
    const themes = { ...(book.definitions?.themes ?? {}), ...standardThemes };
    const numeric = book.definitions?.formats?.numeric ?? {};
    const temporal = book.definitions?.formats?.temporal ?? {};
    const types = book.definitions?.types ?? {};


    for (let p = 0; p < book.pages.length; p++) {
        const pagePath: ObjectPath = ['pages', p];

        const page = book.pages[p]; logger?.page?.(page);

        const pageParents: (TableTheme | TableReference)[] = book.theme ? [book.theme] : [];

        const pageTheme = resolveTheme(page.theme ?? {}, colors, styles, themes, pageParents, [], pagePath);

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

            const groupParents = [...pageParents, ...(page.theme ? [page.theme] : [])];

            const groupTheme = resolveTheme(group.theme ?? {}, colors, styles, themes, groupParents, [], groupPath);

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

                const columnParents = [...groupParents, ...(group.theme ? [group.theme] : [])];

                const columnTheme = resolveTheme(column.theme ?? {}, colors, styles, themes, columnParents, [], columnPath);
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
                    const result = resolveBehavior(column.type, page.name, group.name, column.name, columns, types, colors, styles, numeric, temporal, columnPath);

                    if (!result.success)
                        issues.push(...result.info);
                    else
                        behavior = result.value;
                }

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.value!.header,
                    dataStyle: columnTheme.value!.data,
                    formula,
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
