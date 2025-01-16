import { TableBookProcessIssue } from "../issues";
import { SheetSelector } from "../sheets";
import { Expression, DataSelector } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn } from "./resolveColumns";
import { resolveSelector } from "./resolveSelector";

export const resolveExpression = (
    expression: Expression<DataSelector>,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<Expression<SheetSelector>, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolved: Expression<SheetSelector> | undefined;

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
                }).filter((value): value is Expression<SheetSelector> => value !== undefined)
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
                }).filter((value): value is Expression<SheetSelector> => value !== undefined)
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
    }

    return resolved && issues.length === 0 ? Result.success(resolved) : Result.failure(issues);
};
