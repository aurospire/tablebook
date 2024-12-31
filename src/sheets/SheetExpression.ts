import { Expression } from "../tables/types";
import { SheetPosition, SheetSelector } from "./SheetPosition";

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
    switch (typeof exp) {
        case 'string':
            return toFormulaString(exp);
        case 'number':
            return exp.toString();
        case 'boolean':
            return exp.toString();
        case 'object':
            switch (exp.type) {
                case 'compound':
                    return exp.items.map(item => toFormula(item, position)).join(exp.with);
                case 'function':
                    return `${exp.name}(${exp.args.map(arg => toFormula(arg, position)).join(',')})`;
                case 'negated':
                    return `-(${toFormula(exp.on, position)})`;
                case 'self':
                    return SheetSelector().toAddress(null, position);
                case 'selector':
                    return SheetSelector().toAddress(exp.from, position);
            }
    }
};
