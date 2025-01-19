import { TableBookProcessIssue } from "../issues";
import { Reference, TableBook, TableGroup, TablePage, EnumType, TableColumn, FlatExpression, ColumnType } from "../tables";
import { Result } from "../util";
import { FlatBook, FlatEnumTypeRegex, FlatFormulaSourceRegex, FlatNumericTypeRegex, FlatTypes } from "./types";

export const processFlatBook = (book: FlatBook): Result<TableBook, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    const pages: TablePage[] = [];
    const enumMap: Record<string, EnumType> = {};
    const types: Record<string, ColumnType> = {};
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
        const name = flatEnum.name + 'enum';
        const tableEnum: EnumType = (enumMap[name] ?? (enumMap[name] = { kind: 'enum', items: [] }));

        tableEnum.items.push({
            name: flatEnum.value,
            description: flatEnum.description,
            style: { fore: flatEnum.color }
        });
    }

    for (let p = 0; p < book.tables.length; p++) {
        const flatPage = book.tables[p];

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

                let type: Reference;

                // TODO: Have defaults, but allow custom overrides
                switch (flatColumn.type) {
                    case 'text':
                        type = '@text';
                        if (!('text' in types))
                            types['text'] = { kind: 'text' };
                        break;
                    case 'number':
                        type = '@number';
                        if (!('number' in types))
                            types['number'] = { kind: 'numeric', format: { type: 'number', commas: true } };
                        break;
                    case 'currency':
                        type = '@currency';
                        if (!('currency' in types))
                            types['currency'] = { kind: 'numeric', format: { type: 'currency', commas: true, decimal: 2, symbol: '$' } };
                        break;
                    case 'percent':
                        type = '@percent';
                        if (!('percent' in types))
                            types['percent'] = { kind: 'numeric', format: { type: 'percent', commas: true } };
                        break;
                    case 'date':
                        type = '@date';
                        if (!('date' in types))
                            // Sun, Jan 01, 1900
                            types['date'] = {
                                kind: 'temporal',
                                format: [
                                    { type: 'weekday', length: 'short' },
                                    ', ',
                                    { type: 'month', length: 'short' },
                                    ' ',
                                    { type: 'day', length: 'long' },
                                    ', ',
                                    { type: 'year', length: 'long' }
                                ]
                            };
                        break;
                    case 'datetime':
                        type = '@datetime';
                        // 2021-01-01T00:00:00
                        if (!('datetime' in types))
                            types['datetime'] = {
                                kind: 'temporal',
                                format: [
                                    { type: 'year', length: 'long' },
                                    '-',
                                    { type: 'month', length: 'long' },
                                    '-',
                                    { type: 'day', length: 'long' },
                                    'T',
                                    { type: 'hour', length: 'long' },
                                    ':',
                                    { type: 'minute', length: 'long' },
                                    ':',
                                    { type: 'second', length: 'long' }
                                ]
                            };
                        break;
                    default: {
                        let match;

                        if (match = flatColumn.type.match(FlatNumericTypeRegex)) {
                            const typename = match[1];
                            const decimals = Number(match[2]);

                            const fulltypename = typename + decimals;

                            type = '@' + fulltypename;

                            if (!(fulltypename in types))
                                types[fulltypename] = { kind: 'numeric', format: { type: typename as any, commas: true, decimal: decimals } };
                        }
                        else if (match = flatColumn.type.match(FlatEnumTypeRegex)) {
                            const typename = match[1];

                            type = '@' + typename + 'enum';

                            if (!(typename in enumMap))
                                issues.push({ type: 'processing', message: 'Invalid Enum Reference', data: flatColumn.type, path: ['columns', c] });
                        }
                        else {
                            issues.push({ type: 'processing', message: 'Invalid Column Type', data: flatColumn.type, path: ['columns', c] });
                            type = '@text';
                        }
                    }
                }

                let source: string | undefined;
                let expression: FlatExpression | undefined;

                let match = flatColumn.source.match(FlatFormulaSourceRegex);

                if (match) {
                    source = 'auto';
                    expression = formulaMap[match[1]];
                    if (!expression)
                        issues.push({ type: 'processing', message: 'Invalid Formula Reference', data: flatColumn.source, path: ['columns', c] });
                }

                const column: TableColumn = {
                    name: flatColumn.name,
                    description: flatColumn.description,
                    type: type as Reference,
                    expression,
                    source

                };

                group.columns.push(column);
            }
        }
    };

    return (issues.length === 0)
        ? Result.success({ name: book.name, pages, definitions: { types: enumMap } })
        : Result.failure(issues);
};