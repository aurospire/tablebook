import { TableBookProcessIssue } from '../issues';
import { SheetExpression, SheetSelector } from '../sheets';
import { TableExpression, TableSelector } from '../tables/types';
import { ObjectPath } from '../util';
import { ResolvedColumn } from './resolveColumns';
import { resolveSelector } from './resolveSelector';

export const resolveExpression = (
    expression: TableExpression<TableSelector>,
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): TableExpression<SheetSelector> | undefined => {

    switch (typeof expression) {
        case 'string':
        case 'number':
            return expression;

        default:
            switch (expression.type) {
                case 'function': {
                    return {
                        type: 'function',
                        name: expression.name,
                        items: expression.items
                            .map(arg => resolveExpression(arg, pageName, groupName, columnName, columns, path, issues))
                            .filter((value): value is TableExpression<SheetSelector> => value !== undefined)
                    };
                }
                case 'compare': {
                    const left = resolveExpression(expression.left, pageName, groupName, columnName, columns, path, issues);
                    const right = resolveExpression(expression.right, pageName, groupName, columnName, columns, path, issues);

                    return {
                        type: 'compare',
                        op: expression.op,
                        left: left ?? '',
                        right: right ?? ''
                    };
                }
                case 'combine': {
                    return {
                        type: 'combine',
                        op: expression.op,
                        items: expression.items
                            .map(item => resolveExpression(item, pageName, groupName, columnName, columns, path, issues))
                            .filter((value): value is TableExpression<SheetSelector> => value !== undefined)
                    };
                }
                case 'negate': {
                    const result = resolveExpression(expression.item, pageName, groupName, columnName, columns, path, issues);

                    return result ? { type: 'negate', item: result } : undefined;
                }
                case 'selector': {
                    const result = resolveSelector(expression.selector, columns, pageName, groupName, columnName, path, issues);

                    return result ? { type: 'selector', selector: result } : undefined;
                }
                case 'template': {
                    let resolvedTags: [string, SheetExpression][] = [];

                    if (expression.vars) {
                        for (const [name, subexp] of Object.entries(expression.vars)) {

                            const subexpResult = resolveExpression(subexp, pageName, groupName, columnName, columns, path, issues);

                            if (subexpResult)
                                resolvedTags.push([name, subexpResult]);
                        }
                    }

                    return {
                        type: 'template',
                        text: expression.text,
                        vars: resolvedTags.length ? Object.fromEntries(resolvedTags) : undefined
                    };
                }
            }
    }
};
