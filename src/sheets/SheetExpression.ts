import { TableExpression } from "../tables/types";
import { SheetPosition } from "./SheetPosition";
import { SheetSelector } from "./SheetSelector";

export type SheetExpression = TableExpression<SheetSelector>;

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
            switch (typeof exp.value) {
                case "string":
                    return toFormulaString(exp.value);
                case "number":
                    return exp.value.toString();
                case "boolean":
                    return exp.value ? 'TRUE' : 'FALSE';
            }
        case 'compound':
            return exp.items.map(item => toFormula(item, position)).join(exp.op);
        case 'function':
            return `${exp.name}(${exp.items.map(arg => toFormula(arg, position)).join(',')})`;
        case 'negated':
            return `-(${toFormula(exp.item, position)})`;
        case 'selector':
            return SheetSelector().toAddress(exp.selector, position);
        case 'template': {
            let result = exp.text;

            if (exp.vars) {
                for (const [name, subexp] of Object.entries(exp.vars)) {
                    const formula = toFormula(subexp, position);

                    result = result.replaceAll(name, formula);
                }
            }

            return result;
        }
    }
};
