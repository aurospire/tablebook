import { TableBookProcessIssue } from "../issues";
import { SheetSelector } from "../sheets";
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
                args: expression.args.map(arg => {
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
                with: expression.with,
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
            const result = resolveExpression(expression.on, page, group, name, columns, path);

            if (result.success)
                resolved = { type: 'negated', on: result.value };
            else
                issues.push(...result.info);

            break;
        }
        case "selector": {
            const result = resolveSelector(expression.from, columns, page, group, name, path);
            if (result.success)
                resolved = { type: 'selector', from: result.value };
            else
                issues.push(...result.info);

            break;
        }
        case 'raw': {
            let resolvedTags: [string, SheetSelector][] = [];

            if (expression.tags) {
                for (const [tag, selector] of Object.entries(expression.tags)) {
                    const selectorResult = resolveSelector(selector, columns, page, group, name, path);

                    if (selectorResult.success) {
                        const value = selectorResult.value;

                        value.page = value.page === page ? undefined : value.page;

                        resolvedTags.push([tag, value]);
                    }
                    else {
                        issues.push(...selectorResult.info);
                    }
                }
            }

            resolved = { type: 'raw', text: expression.text, tags: resolvedTags.length ? Object.fromEntries(resolvedTags) : undefined };
        }
    }

    return resolved && issues.length === 0 ? Result.success(resolved) : Result.failure(issues, resolved);
};
