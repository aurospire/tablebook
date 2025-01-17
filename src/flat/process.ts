import { TableBookProcessIssue } from "../issues";
import { Reference, TableBook, TableGroup, TablePage, EnumType, TableColumn, FlatExpression } from "../tables";
import { Result } from "../util";
import { FlatBook } from "./types";

export const processFlatBook = (book: FlatBook): Result<TableBook, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    const pages: TablePage[] = [];
    const enumMap: Record<string, EnumType> = {};
    const formulaMap: Record<string, FlatExpression> = {};
    const pageMap: Record<string, TablePage> = {};
    const groupMap: Record<string, TableGroup> = {};
    const columnSet: Set<string> = new Set();

    for (let f = 0; f < book.formulas.length; f++) {
        const flatFormula = book.formulas[f];

        if (flatFormula.name in formulaMap)
            issues.push({ type: 'processing', message: 'Duplicate Formula', data: flatFormula, path: ['formulas', f] });
        else {
            formulaMap[flatFormula.name] = {
                type: 'flat',
                expression: flatFormula.formula,
                refs: !flatFormula.refs
                    ? undefined
                    : Object.fromEntries(Object
                        .entries(flatFormula.refs)
                        .map(([name, { page, group, column }]) => ([name, { page, group, name: column }])))
            };
        }
    }

    for (const flatEnum of book.enums) {
        const tableEnum: EnumType = (enumMap[flatEnum.name] ?? (enumMap[flatEnum.name] = { kind: 'enum', items: [] }));

        tableEnum.items.push({
            name: flatEnum.value,
            description: flatEnum.description,
            style: { fore: flatEnum.color }
        });
    }

    for (let p = 0; p < book.pages.length; p++) {
        const flatPage = book.pages[p];

        const page: TablePage = {
            name: flatPage.name,
            description: flatPage.description,
            rows: flatPage.rows,
            theme: '@' + flatPage.palette as Reference,
            groups: []
        };

        if (flatPage.name in pageMap)
            issues.push({ type: 'processing', message: 'Duplicate Page', data: flatPage, path: ['paths', p] });
        else {
            pageMap[flatPage.name] = page;
            pages.push(page);
        }
    }

    for (let g = 0; g < book.groups.length; g++) {
        const flatGroup = book.groups[g];

        const group: TableGroup = {
            name: flatGroup.name,
            description: flatGroup.description,
            columns: [],
        };

        const key = flatGroup.page + '.' + flatGroup.name;

        const page = pageMap[flatGroup.page];

        if (!page)
            issues.push({ type: 'processing', message: 'Invalid Page Reference', data: flatGroup, path: ['groups', g] });

        else if (key in groupMap)
            issues.push({ type: 'processing', message: 'Duplicate Group', data: flatGroup, path: ['groups', g] });

        else {
            groupMap[key] = group;
            page.groups.push(group);
        }
    }

    for (let c = 0; c < book.columns.length; c++) {
        const flatColumn = book.columns[c];

        const groupKey = flatColumn.page + '.' + flatColumn.group;

        const columnKey = groupKey + '.' + flatColumn.name;

        if (!(flatColumn.name in pageMap))
            issues.push({ type: 'processing', message: 'Invalid Page Reference', data: flatColumn.page, path: ['columns', c] });
        else {
            const group = groupMap[groupKey];

            if (!group)
                issues.push({ type: 'processing', message: 'Invalid Group Reference', data: flatColumn.group, path: ['columns', c] });
            else if (columnSet.has(columnKey))
                issues.push({ type: 'processing', message: 'Duplicate Column', data: flatColumn, path: ['columns', c] });
            else {
                const column: TableColumn = {
                    name: flatColumn.name,
                    description: flatColumn.description,
                    source: flatColumn.source,


                };

                group.columns.push(column);
            }
        }
    };

    return (issues.length === 0)
        ? Result.success({ name: book.name, pages, definitions: { types: enumMap } })
        : Result.failure(issues);
};