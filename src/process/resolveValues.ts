import { TableBookProcessIssue } from "../issues";
import { SheetExpression, SheetValues } from "../sheets";
import { TableExpression, TableValues } from "../tables";
import { ObjectPath, Result } from "../util";
import { resolveExpression } from "./resolveExpression";

const resolveSingleExpression = (
    item: TableExpression,
    page: string, group: string, column: string,
    columns: Map<string, any>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetExpression | undefined => {
    const result = resolveExpression(item, page, group, column, columns, path);

    if (result.success)
        return result.value;
    else
        issues.push(...result.info);
};

const resolveExpressionList = (
    items: TableExpression[],
    page: string, group: string, column: string,
    columns: Map<string, any>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetExpression[] | undefined => {
    const resolvedItems: SheetExpression[] = items.map((value, i) => {
        const result = resolveExpression(value, page, group, column, columns, path);

        if (result.success)
            return result.value;
        else {
            issues.push(...result.info);
            return undefined;
        }
    }).filter((value): value is SheetExpression => value !== undefined);

    if (resolvedItems.length > 0)
        return resolvedItems;
};

export const resolveValues = (
    values: TableValues,
    page: string, group: string, column: string,
    columns: Map<string, any>,
    path: ObjectPath
): Result<SheetValues, TableBookProcessIssue[]> => {

    const issues: TableBookProcessIssue[] = [];

    let resolved: SheetValues;

    if (typeof values === 'string' || typeof values === 'number')
        resolved = { rest: values };
    else if ('type' in values)
        resolved = { rest: resolveSingleExpression(values, page, group, column, columns, path, issues) };
    else if (Array.isArray(values))
        resolved = { items: resolveExpressionList(values, page, group, column, columns, path, issues) };
    else {
        resolved = {
            items: values.items ? resolveExpressionList(values.items, page, group, column, columns, path, issues) : undefined,
            rest: values.rest ? resolveSingleExpression(values.rest, page, group, column, columns, path, issues) : undefined
        };
    }

    return issues.length === 0 ? Result.success(resolved) : Result.failure(issues, resolved);
};