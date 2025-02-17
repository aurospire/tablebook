import { TableBookProcessIssue } from "../issues";
import { SheetExpression, SheetValues } from "../sheets";
import { TableExpression, TableValues } from "../tables";
import { ObjectPath } from "../util";
import { resolveExpression } from "./resolveExpression";

const resolveExpressionList = (
    items: TableExpression[],
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, any>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetExpression[] | undefined => {
    return items.map((value, i) => resolveExpression(value, pageName, groupName, columnName, columns, path, issues) ?? '');
};

export const resolveValues = (
    values: TableValues,
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, any>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetValues | undefined => {

    if (typeof values === 'string' || typeof values === 'number')
        return { rest: values };
    else if ('type' in values)
        return { rest: resolveExpression(values, pageName, groupName, columnName, columns, path, issues) };
    else if (Array.isArray(values))
        return { items: resolveExpressionList(values, pageName, groupName, columnName, columns, path, issues) };
    else {
        return {
            items: values.items ? resolveExpressionList(values.items, pageName, groupName, columnName, columns, path, issues) : undefined,
            rest: values.rest ? resolveExpression(values.rest, pageName, groupName, columnName, columns, path, issues) : undefined
        };
    }
};