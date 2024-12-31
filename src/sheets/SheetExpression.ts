import { UnitSelector, Expression, UnitSelectorRegex } from "../tables/types";
import { SheetSelector, SheetPosition } from "./SheetPosition";



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




export type SheetExpression = Expression<SheetSelector>;


export const toFormula = (exp: SheetExpression, position: SheetPosition<number>): string => {
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
