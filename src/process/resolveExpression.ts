import { SheetSelector } from "../sheets";
import { Expression, DataSelector } from "../tables/types";
import { ResolvedColumn } from "./resolveColumns";
import { resolveSelector } from "./resolveSelector";

export const resolveExpression = (expression: Expression<DataSelector>, page: string, group: string, name: string, columns: Map<string, ResolvedColumn>): Expression<SheetSelector> => {
    switch (expression.type) {
        case "literal":
            return expression;
        case "function":
            return {
                type: "function",
                name: expression.name,
                args: expression.args.map(arg => resolveExpression(arg, page, group, name, columns))
            };
        case "compound":
            return {
                type: "compound",
                with: expression.with,
                items: expression.items.map(item => resolveExpression(item, page, group, name, columns))
            };
        case "negated":
            return {
                type: 'negated',
                on: resolveExpression(expression.on, page, group, name, columns)
            };
        case "selector": {
            return {
                type: 'selector',
                from: resolveSelector(expression.from, columns, page, group, name)
            };
        }
    }
};
