import { Expression } from "../tables/types";
import { SheetPosition } from "./SheetPosition";
import { SheetSelector } from "./SheetSelector";

export type SheetExpression = Expression<SheetSelector>;

const chars: Record<string, string> = {
    '\t': 'CHAR(9)',
    '\n': 'CHAR(10)',
    '\r\n': 'CHAR(10)',
    '"': 'CHAR(34)'
};

const toFormulaString = (value: string): string => {
    return value.split(/(\t|\r?\n|")/).filter(Boolean).map(part => {
        const char = chars[part];
        return char ? char : `"${part}"`;
    }).join(' & ');
};

export const toFormula = (exp: SheetExpression, position: SheetPosition): string => {

    switch (exp.type) {
        case 'literal':
            switch (typeof exp.of) {
                case "string":
                    return toFormulaString(exp.of);
                case "number":
                    return exp.of.toString();
                case "boolean":
                    return exp.of ? 'TRUE' : 'FALSE';
            }
        case 'compound':
            return exp.items.map(item => toFormula(item, position)).join(exp.with);
        case 'function':
            return `${exp.name}(${exp.args.map(arg => toFormula(arg, position)).join(',')})`;
        case 'negated':
            return `-(${toFormula(exp.on, position)})`;
        case 'selector':
            return SheetSelector().toAddress(exp.from, position);
        case 'raw': {
            let result = exp.expression;
            if (exp.refs) {
                for (const [key, value] of Object.entries(exp.refs)) {
                    const selector = SheetSelector().toAddress(value, position);
                    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), selector);
                }
            }

            return result;
        }
    }
};
