import { TableBookProcessIssue } from "../issues";
import { SheetSelector } from "../sheets";
import { DataSelector, UnitSelector } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn, toLookupName } from "./resolveColumns";

const modifyUnitSelector = (selector: UnitSelector, grouped: boolean): UnitSelector => {
    if (selector[0] !== '$')
        return selector;

    const value = Number(selector.slice(1));

    return `${selector[0]}${value + (grouped ? 2 : 1)}`;
};

export const resolveSelector = (
    selector: DataSelector,
    columns: Map<string, ResolvedColumn>,
    page: string, group: string, name: string,
    path: ObjectPath
): Result<SheetSelector, TableBookProcessIssue[]> => {

    const { column, row } = selector === 'self' ? { column: 'self', row: 'self' } : selector;

    let selectedPage: string | undefined;
    let selectedColumn: ResolvedColumn;

    if (typeof column === 'string')
        selectedColumn = columns.get(toLookupName(page, group, name))!;
    else {
        const fullname = toLookupName(
            column.page ?? page,
            column.group ?? group,
            column.name
        );

        if (!columns.has(fullname))
            return Result.failure([{ type: 'processing', message: `Invalid column`, path, data: fullname }]);

        selectedColumn = columns.get(fullname)!;

        selectedPage = column.page;
    }

    let selectedRowStart: UnitSelector;
    let selectedRowEnd: UnitSelector | true | undefined;

    if (typeof row === 'string') {
        if (row === 'self')
            selectedRowStart = '+0';
        else if (row === 'all') {
            selectedRowStart = '$0';
            selectedRowEnd = true;
        }
        else
            selectedRowStart = row as UnitSelector;
    }
    else {
        if (row.from < row.to) {
            selectedRowStart = row.from;
            selectedRowEnd = row.to;
        }
        else {
            selectedRowStart = row.to;
            selectedRowEnd = row.from;
        }
    }

    return Result.success({
        page: selectedPage,
        from: {
            col: `$${selectedColumn.index}`,
            row: modifyUnitSelector(selectedRowStart, selectedColumn.grouped)
        },
        to: selectedRowEnd ? {
            col: `$${selectedColumn.index}`,
            row: selectedRowEnd === true ? undefined : modifyUnitSelector(selectedRowEnd, selectedColumn.grouped)
        } : undefined
    });
};
