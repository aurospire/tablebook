import { TableBookProcessIssue } from "../issues";
import { ColumnSelector, ColumnType, DataSelector, EnumType, RawExpression, Reference, RowSelector, TableBook, TableColumn, TableGroup, TablePage, TemporalFormat, UnitSelector } from "../tables";
import { Result } from "../util";
import { FlatBook, FlatDollarType, FlatEnumTypeRegex, FlatFormulaSourceRegex, FlatLookupTypeRegex, FlatNumericTypeRegex, FlatRowSelectionRegex, FlatTemporalTypeRegex, FlatTextType } from "./types";

const temporals: Record<string, TemporalFormat> = {
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

export const processFlatBook = (book: FlatBook): Result<TableBook, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    const pages: TablePage[] = [];
    const enumMap: Record<string, EnumType> = {};
    const types: Record<string, ColumnType> = {};
    const formulaMap: Record<string, RawExpression<DataSelector>> = {};
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
                expression: flatFormula.formula,
                refs: !flatFormula.refs
                    ? undefined
                    : Object.fromEntries(flatFormula.refs.map(ref => {

                        const column: ColumnSelector = { page: ref.selection.table, group: ref.selection.group, name: ref.selection.column };

                        const [_, all, from, to] = ref.selection.rows.match(FlatRowSelectionRegex) ?? ['all', 'all'];

                        const rows: RowSelector = from === 'all'
                            ? 'all'
                            : to === undefined
                                ? from as UnitSelector
                                : { from: from as UnitSelector, to: to as UnitSelector };

                        return [ref.tag, { column, rows }];
                    }))
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

    for (let t = 0; t < book.tables.length; t++) {
        const flatTable = book.tables[t];

        const page: TablePage = {
            name: flatTable.name,
            description: flatTable.description,
            rows: flatTable.rows,
            theme: '@' + flatTable.palette as Reference,
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

        const key = flatGroup.table + '.' + flatGroup.name;

        const page = pageMap[flatGroup.table];

        if (!page)
            issues.push({ type: 'processing', message: 'Invalid Table Reference', data: flatGroup, path: ['groups', g] });

        else if (key in groupMap)
            issues.push({ type: 'processing', message: 'Duplicate Group', data: flatGroup, path: ['groups', g] });

        else {
            groupMap[key] = group;
            page.groups.push(group);
        }
    }

    for (let c = 0; c < book.columns.length; c++) {
        const flatColumn = book.columns[c];

        const groupKey = flatColumn.table + '.' + flatColumn.group;

        const columnKey = groupKey + '.' + flatColumn.name;

        if (!(flatColumn.name in pageMap))
            issues.push({ type: 'processing', message: 'Invalid Page Reference', data: flatColumn.table, path: ['columns', c] });
        else {
            const group = groupMap[groupKey];

            if (!group)
                issues.push({ type: 'processing', message: 'Invalid Group Reference', data: flatColumn.group, path: ['columns', c] });
            else if (columnSet.has(columnKey))
                issues.push({ type: 'processing', message: 'Duplicate Column', data: flatColumn, path: ['columns', c] });
            else {

                let type: Reference;

                let match;

                if (flatColumn.type === FlatTextType) {
                    type = '@text';

                    if (!('text' in types))
                        types['text'] = { kind: 'text' };
                }
                else if (flatColumn.type === FlatDollarType) {
                    type = '@dollar';

                    if (!('dollar' in types))
                        types['dollar'] = { kind: 'numeric', format: { type: 'currency', commas: true, decimal: 2, symbol: '$' } };
                }
                else if (match = flatColumn.type.match(FlatNumericTypeRegex)) {
                    const typename = match[1];
                    const decimals = Number(match[2]) ?? 0;

                    const fulltypename = typename + decimals;

                    type = '@' + fulltypename;

                    if (!(fulltypename in types))
                        types[fulltypename] = { kind: 'numeric', format: { type: typename as any, commas: true, decimal: decimals } };
                }
                else if (match = flatColumn.type.match(FlatTemporalTypeRegex)) {
                    const typename = match[1];
                    const typeformat = match[2];

                    const fulltypename = typename + typeformat;

                    type = '@' + fulltypename;

                    if (!(fulltypename in types)) {
                        const format = temporals[typename + typeformat];

                        types[fulltypename] = { kind: 'temporal', format };
                    }

                }
                else if (match = flatColumn.type.match(FlatEnumTypeRegex)) {
                    const typename = match[1];

                    const fulltypename = 'enum' + '::' + typename;
                    type = '@' + fulltypename;

                    if (!(typename in enumMap))
                        issues.push({ type: 'processing', message: 'Invalid Enum Reference', data: flatColumn.type, path: ['columns', c] });
                }
                else if (match = flatColumn.type.match(FlatLookupTypeRegex)) {
                    const table = match[1];
                    const group = match[2];
                    const column = match[3];

                    const fulltypename = 'lookup' + '::' + table + '::' + group + '::' + column;
                    type = '@' + fulltypename;
                    if (!pageMap[table])
                        issues.push({ type: 'processing', message: 'Invalid Table Reference', data: flatColumn.type, path: ['columns', c] });
                    else if (!groupMap[table + '.' + group])
                        issues.push({ type: 'processing', message: 'Invalid Group Reference', data: flatColumn.type, path: ['columns', c] });
                    else if (!columnSet.has(table + '.' + group + '.' + column))
                        issues.push({ type: 'processing', message: 'Invalid Column Reference', data: flatColumn.type, path: ['columns', c] });

                    if (!(fulltypename in types))
                        types[fulltypename] = { kind: 'lookup', values: { page: table, group, name: column } };
                }
                else {
                    issues.push({ type: 'processing', message: 'Invalid Column Type', data: flatColumn.type, path: ['columns', c] });
                    type = '@text';
                }


                let source: string | undefined;
                let expression: RawExpression<DataSelector> | undefined;

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