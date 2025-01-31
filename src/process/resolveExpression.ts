import { TableBookProcessIssue } from "../issues";
import { SheetExpression, SheetSelector } from "../sheets";
import { TableExpression, TableSelector } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn } from "./resolveColumns";
import { resolveSelector } from "./resolveSelector";

export const resolveExpression = (
    expression: TableExpression<TableSelector>,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<TableExpression<SheetSelector>, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolved: TableExpression<SheetSelector> | undefined;

    switch (expression.type) {
        case "literal": {
            resolved = expression;
            break;
        }
        case "function": {
            resolved = {
                type: "function",
                name: expression.name,
                items: expression.items.map(arg => {
                    const result = resolveExpression(arg, page, group, name, columns, path);

                    if (result.success)
                        return result.value;
                    else {
                        issues.push(...result.info);
                        return undefined;
                    }
                }).filter((value): value is TableExpression<SheetSelector> => value !== undefined)
            };
            break;
        }
        case "compound": {
            resolved = {
                type: "compound",
                op: expression.op,
                items: expression.items.map(item => {
                    const result = resolveExpression(item, page, group, name, columns, path);

                    if (result.success)
                        return result.value;
                    else {
                        issues.push(...result.info);
                        return undefined;
                    }
                }).filter((value): value is TableExpression<SheetSelector> => value !== undefined)
            };
            break;
        }
        case "negated": {
            const result = resolveExpression(expression.item, page, group, name, columns, path);

            if (result.success)
                resolved = { type: 'negated', item: result.value };
            else
                issues.push(...result.info);

            break;
        }
        case "selector": {
            const result = resolveSelector(expression.selector, columns, page, group, name, path);
            if (result.success)
                resolved = { type: 'selector', selector: result.value };
            else
                issues.push(...result.info);

            break;
        }
        case 'template': {
            let resolvedTags: [string, SheetExpression][] = [];

            if (expression.vars) {
                for (const [name, subexp] of Object.entries(expression.vars)) {

                    const subexpResult = resolveExpression(subexp, page, group, name, columns, path);

                    if (subexpResult.success)
                        resolvedTags.push([name, subexpResult.value]);
                    else
                        issues.push(...subexpResult.info);
                }
            }

            resolved = {
                type: 'template',
                text: expression.text,
                vars: resolvedTags.length ? Object.fromEntries(resolvedTags) : undefined
            };
        }
    }

    return resolved && issues.length === 0 ? Result.success(resolved) : Result.failure(issues, resolved);
};
