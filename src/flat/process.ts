import { TableBookProcessIssue } from "../issues";
import { TableColumnSelector, TableColumnType, TableSelector, TableEnumType, TableHeaderStyle, TableRawExpression, TableReference, TableRowSelector, TableSelfSelector, TableBook, TableColumn, TableGroup, TablePage, TableTemporalFormat, TableTheme, TableUnitSelector } from "../tables";
import { Result } from "../util";
import { FlatBook, FlatDollarType, FlatEnumTypeRegex, FlatFormulaSourceRegex, FlatLookupTypeRegex, FlatNumericTypeRegex, FlatRowSelectionRegex, FlatTemporalTypeRegex, FlatTextType } from "./types";

const temporals: Record<string, TableTemporalFormat> = {
    // YYYY-MM-DD
    dateiso: [
        { type: 'year', length: 'long' },
        '-',
        { type: 'month', length: 'long' },
        '-',
        { type: 'day', length: 'long' }
    ],
    // YYYY-MM-DDTHH:MM:SS
    datetimeiso: [
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
    ],
    // Sun, Jan 01, 2021
    datetext: [
        { type: 'weekday', length: 'short' },
        ', ',
        { type: 'month', length: 'short' },
        ' ',
        { type: 'day', length: 'long' },
        ', ',
        { type: 'year', length: 'long' }
    ],
    // Sun, Jan 01, 2021 12:00 AM
    datetimetext: [
        { type: 'weekday', length: 'short' },
        ', ',
        { type: 'month', length: 'short' },
        ' ',
        { type: 'day', length: 'long' },
        ', ',
        { type: 'year', length: 'long' },
        ' ',
        { type: 'hour', length: 'long' },
        ':',
        { type: 'minute', length: 'long' },
        ' ',
        { type: 'meridiem', length: 'long' }
    ]
};

export type NameMaker = (parts: string[], column: { page: string, group: string, name: string; }) => string;

const defaultNameMaker = (parts: string[]) => ['flat', ...parts].join(':');

export const processFlatBook = (book: FlatBook, makeName?: NameMaker): Result<TableBook, TableBookProcessIssue[]> => {
    makeName ??= defaultNameMaker;

    const issues: TableBookProcessIssue[] = [];

    const pages: TablePage[] = [];
    const enumMap: Record<string, TableEnumType> = {};
    const types: Record<string, TableColumnType> = {};
    const formulaMap: Record<string, TableRawExpression<TableSelector>> = {};
    const pageMap: Record<string, TablePage> = {};
    const groupMap: Record<string, TableGroup> = {};
    const columnSet: Set<string> = new Set();

    for (let f = 0; f < book.formulas.length; f++) {
        const flatFormula = book.formulas[f];

        if (flatFormula.name in formulaMap)
            issues.push({ type: 'processing', message: 'Duplicate Formula', data: flatFormula, path: ['formulas', f] });
        else {
            formulaMap[flatFormula.name] = {
                type: 'raw',
                text: flatFormula.formula,
                refs: !flatFormula.refs
                    ? undefined
                    : Object.fromEntries(flatFormula.refs.map(ref => {

                        const column: TableColumnSelector = { page: ref.selection.page, group: ref.selection.group, name: ref.selection.column };

                        const [_, self, all, from, to] = ref.selection.rows.match(FlatRowSelectionRegex) ?? ['all', 'all'];

                        const rows: TableRowSelector | TableSelfSelector =
                            self ? 'self' :
                                all ? 'all' :
                                    to === undefined
                                        ? from as TableUnitSelector
                                        : { from: from as TableUnitSelector, to: to as TableUnitSelector };

                        return [ref.tag, { column, rows }];
                    }))
            };
        }
    }

    for (const flatEnum of book.enums) {
        const name = flatEnum.name;
        const tableEnum: TableEnumType = (enumMap[name] ?? (enumMap[name] = { kind: 'enum', items: [] }));

        tableEnum.items.push({
            name: flatEnum.value,
            description: flatEnum.description,
            style: { fore: flatEnum.color }
        });

        enumMap[name] = tableEnum;
    }

    for (let t = 0; t < book.pages.length; t++) {
        const flatTable = book.pages[t];

        const page: TablePage = {
            name: flatTable.name,
            description: flatTable.description,
            rows: flatTable.rows,
            theme: '@' + flatTable.palette as TableReference,
            groups: []
        };

        if (flatTable.name in pageMap)
            issues.push({ type: 'processing', message: 'Duplicate Table', data: flatTable, path: ['tables', t] });
        else {
            pageMap[flatTable.name] = page;
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
            issues.push({ type: 'processing', message: 'Invalid Table Reference', data: flatGroup, path: ['groups', g] });

        else if (key in groupMap)
            issues.push({ type: 'processing', message: 'Duplicate Group', data: flatGroup, path: ['groups', g] });

        else {
            groupMap[key] = group;
            page.groups.push(group);
        }
    }

    // Gather all the names first
    for (let c = 0; c < book.columns.length; c++) {
        const flatColumn = book.columns[c];

        const columnKey = flatColumn.page + '.' + flatColumn.group + '.' + flatColumn.name;

        if (columnSet.has(columnKey))
            issues.push({ type: 'processing', message: 'Duplicate Column', data: columnKey, path: ['columns', c] });
        else
            columnSet.add(columnKey);
    }

    for (let c = 0; c < book.columns.length; c++) {
        const flatColumn = book.columns[c];

        const groupKey = flatColumn.page + '.' + flatColumn.group;

        const columnInfo = { page: flatColumn.page, group: flatColumn.group, name: flatColumn.name };

        if (!(flatColumn.page in pageMap)) {
            issues.push({ type: 'processing', message: 'Invalid Table Reference', data: flatColumn.page, path: ['columns', c] });
        }
        else {
            const group = groupMap[groupKey];

            if (!group)
                issues.push({ type: 'processing', message: 'Invalid Group Reference', data: groupKey, path: ['columns', c] });
            else {

                let type: TableReference;

                let match;

                if (flatColumn.type === FlatTextType) {
                    const fullname = makeName(['text'], columnInfo);

                    type = '@' + fullname;

                    if (!(fullname in types))
                        types[fullname] = { kind: 'text' };
                }
                else if (flatColumn.type === FlatDollarType) {
                    const fullname = makeName(['dollar'], columnInfo);

                    type = '@' + fullname;

                    if (!(fullname in types))
                        types[fullname] = { kind: 'numeric', format: { type: 'currency', commas: true, decimal: 2, symbol: '$' } };
                }
                else if (match = flatColumn.type.match(FlatNumericTypeRegex)) {
                    const typename = match[1];
                    const decimals = Number(match[2]) ?? 0;

                    const fullname = makeName([typename, decimals.toString()], columnInfo);

                    type = '@' + fullname;

                    if (!(fullname in types))
                        types[fullname] = { kind: 'numeric', format: { type: typename as any, commas: true, decimal: decimals } };
                }
                else if (match = flatColumn.type.match(FlatTemporalTypeRegex)) {
                    const typename = match[1];
                    const typeformat = match[2];

                    const fullname = makeName([typename, typeformat], columnInfo);

                    type = '@' + fullname;

                    if (!(fullname in types)) {
                        const format = temporals[typename + typeformat];

                        types[fullname] = { kind: 'temporal', format };
                    }

                }
                else if (match = flatColumn.type.match(FlatEnumTypeRegex)) {
                    const typename = match[1];

                    const fullname = makeName(['enum', typename], columnInfo);

                    type = '@' + fullname;

                    if (!(typename in enumMap))
                        issues.push({ type: 'processing', message: 'Invalid Enum Reference', data: typename, path: ['columns', c] });

                    if (!(fullname in types))
                        types[fullname] = enumMap[typename];

                }
                else if (match = flatColumn.type.match(FlatLookupTypeRegex)) {
                    const page = match[1];
                    const group = match[2];
                    const column = match[3];

                    const fullname = makeName(['lookup', page, group, column], columnInfo);

                    type = '@' + fullname;
                    if (!pageMap[page])
                        issues.push({ type: 'processing', message: 'Invalid Table Reference', data: flatColumn.type, path: ['columns', c] });
                    else if (!groupMap[page + '.' + group])
                        issues.push({ type: 'processing', message: 'Invalid Group Reference', data: flatColumn.type, path: ['columns', c] });
                    else if (!columnSet.has(page + '.' + group + '.' + column))
                        issues.push({ type: 'processing', message: 'Invalid Column Reference', data: flatColumn.type, path: ['columns', c] });

                    if (!(fullname in types))
                        types[fullname] = { kind: 'lookup', values: { page: page, group, name: column } };
                }
                else {
                    issues.push({ type: 'processing', message: 'Invalid Column Type', data: flatColumn.type, path: ['columns', c] });
                    type = '@text';
                }


                let source: string | undefined;
                let expression: TableRawExpression<TableSelector> | undefined;

                match = flatColumn.source.match(FlatFormulaSourceRegex);

                if (match) {
                    source = 'auto';
                    expression = formulaMap[match[1]];
                    if (!expression)
                        issues.push({ type: 'processing', message: 'Invalid Formula Reference', data: flatColumn.source, path: ['columns', c] });
                }

                const column: TableColumn = {
                    name: flatColumn.name,
                    description: flatColumn.description,
                    source,
                    type: type as TableReference,
                    expression,

                };

                group.columns.push(column);
            }
        }
    };

    const headerStyle: TableHeaderStyle = { fore: '#ffffff', bold: true };
    const main: TableTheme = { group: '@group', header: '@header', };

    return (issues.length === 0)
        ? Result.success({
            name: book.name,
            pages,
            definitions: {
                types, styles: {
                    group: { fore: '#ffffff', bold: true, between: { type: 'thin', color: '#555555' } },
                    header: { fore: '#ffffff', bold: true }
                },
                themes: {
                    main: { group: '@group', header: '@header', }
                }
            },
            theme: '@main'
        })
        : Result.failure(issues);
};