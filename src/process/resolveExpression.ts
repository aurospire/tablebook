import { TableBookProcessIssue } from '../issues';
import { SheetExpression, SheetSelector } from '../sheets';
import { TableExpression, TableSelector } from '../tables/types';
import { ObjectPath, Result } from '../util';
import { ResolvedColumn } from './resolveColumns';
import { resolveSelector } from './resolveSelector';

export const resolveExpression = (
    expression: TableExpression<TableSelector>,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<TableExpression<SheetSelector>, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolved: TableExpression<SheetSelector> | undefined;

    switch (typeof expression) {
        case 'string':
        case 'number':
            return Result.success(expression);

        default:
            switch (expression.type) {
                case 'function': {
                    resolved = {
                        type: 'function',
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
                case 'compare': {
                    const left = resolveExpression(expression.left, page, group, name, columns, path);
                    const right = resolveExpression(expression.right, page, group, name, columns, path);

                    if (!left.success) issues.push(...left.info);
                    if (!right.success) issues.push(...right.info);

                    resolved = {
                        type: 'compare',
                        op: expression.op,
                        left: left.success ? left.value : '',
                        right: right.success ? right.value : ''
                    };
                    break;
                }
                case 'combine': {
                    resolved = {
                        type: 'combine',
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
                case 'negate': {
                    const result = resolveExpression(expression.item, page, group, name, columns, path);

                    if (result.success)
                        resolved = { type: 'negate', item: result.value };
                    else
                        issues.push(...result.info);

                    break;
                }
                case 'selector': {
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
    }

    return resolved && issues.length === 0 ? Result.success(resolved) : Result.failure(issues, resolved);
};
