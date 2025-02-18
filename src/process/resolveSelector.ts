import { TableBookProcessIssue } from "../issues";
import { SheetSelector } from "../sheets";
import { TableSelector, TableUnitSelector } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn, toLookupName } from "./resolveColumns";

const modifyUnitSelector = (selector: TableUnitSelector, grouped: boolean): TableUnitSelector => {
    if (selector[0] !== '$')
        return selector;

    const value = Number(selector.slice(1));

    return `${selector[0]}${value + (grouped ? 2 : 1)}`;
};

export const resolveSelector = (
    selector: TableSelector,
    columns: Map<string, ResolvedColumn>,
    pageName: string, groupName: string | undefined, columnName: string,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetSelector | undefined => {

    const { column, rows } = selector === 'self' ? { column: 'self', rows: 'self' } : selector;

    let selectedPage: string | undefined;
    let selectedColumn: ResolvedColumn;

    if (typeof column === 'string')
        selectedColumn = columns.get(toLookupName(pageName, groupName, columnName))!;
    else {
        const fullname = toLookupName(
            column.page ?? pageName,
            column.group ?? column.page ? column.group : groupName,
            column.name
        );

        console.log(column, {pageName, groupName, columnName}, fullname);

        if (!columns.has(fullname)) {
            issues.push({ type: 'processing', message: `Invalid column`, path, data: fullname });
            return undefined;
        }

        selectedColumn = columns.get(fullname)!;

        selectedPage = column.page;
    }

    let selectedRowStart: TableUnitSelector;
    let selectedRowEnd: TableUnitSelector | true | undefined;

    if (typeof rows === 'string') {
        if (rows === 'self')
            selectedRowStart = '+0';
        else if (rows === 'all') {
            selectedRowStart = '$0';
            selectedRowEnd = true;
        }
        else
            selectedRowStart = rows as TableUnitSelector;
    }
    else {
        if (rows.from < rows.to) {
            selectedRowStart = rows.from;
            selectedRowEnd = rows.to;
        }
        else {
            selectedRowStart = rows.to;
            selectedRowEnd = rows.from;
        }
    }

    return {
        page: selectedPage,
        from: {
            col: `$${selectedColumn.index}`,
            row: modifyUnitSelector(selectedRowStart, selectedColumn.grouped)
        },
        to: selectedRowEnd ? {
            col: `$${selectedColumn.index}`,
            row: selectedRowEnd === true ? undefined : modifyUnitSelector(selectedRowEnd, selectedColumn.grouped)
        } : undefined
    };
};
