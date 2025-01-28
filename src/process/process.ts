import { TableBookProcessIssue } from "../issues";
import { StandardPalette, StandardPalettes } from "../palettes";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "../sheets/SheetBook";
import { TableBook, TableColor, TableColumn, TableColumnType, TableGroup, TableNumericFormat, TablePage, TableReference, TableStyle, TableTemporalFormat, TableTheme } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { resolveBehavior } from "./resolveBehavior";
import { resolveColumns } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { MissingReferenceResolver, ReferenceResolver } from "./resolveReference";
import { resolveTheme } from "./resolveTheme";


export type MissingReferenceResolvers = {
    colors?: MissingReferenceResolver<TableColor>;
    styles?: MissingReferenceResolver<TableStyle>;
    themes?: MissingReferenceResolver<TableTheme>;
    format?: {
        numeric?: MissingReferenceResolver<TableNumericFormat>;
        temporal?: MissingReferenceResolver<TableTemporalFormat>;
    };
    types?: MissingReferenceResolver<TableColumnType>;
};


export type TableProcessLogger = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};


const standardThemeResolver: MissingReferenceResolver<TableTheme> = (name, path) => {
    if (name in StandardPalettes) {
        const palette: StandardPalette = (StandardPalettes as any)[name];

        const theme: TableTheme = {
            tab: palette.main,
            group: { back: palette.darkest },
            header: { back: palette.dark },
            data: { back: palette.lightest },
        };

        return Result.success(theme);
    }
    else {
        return Result.failure({ message: `Standard theme not found.`, path, data: name });
    }
};

export const processTableBook = (book: TableBook, onMissing?: MissingReferenceResolvers[], logger?: TableProcessLogger): Result<SheetBook, TableBookProcessIssue[]> => {
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
    const colors = new ReferenceResolver(book.definitions?.colors, onMissing?.map(item => item.colors));
    const styles = new ReferenceResolver(book.definitions?.styles, onMissing?.map(item => item.styles));
    const themes = new ReferenceResolver(book.definitions?.themes, [standardThemeResolver, ...(onMissing?.map(item => item.themes) ?? [])]);
    const numeric = new ReferenceResolver(book.definitions?.formats?.numeric, onMissing?.map(item => item.format?.numeric));
    const temporal = new ReferenceResolver(book.definitions?.formats?.temporal, onMissing?.map(item => item.format?.temporal));
    const types = new ReferenceResolver(book.definitions?.types, onMissing?.map(item => item.types));


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
