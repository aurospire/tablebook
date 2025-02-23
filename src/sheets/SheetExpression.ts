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

export const substringSort = <T>(record: Record<string, T>): [key: string, value: T][] => {
    const entries= Object.entries(record);

    // Sort function
    entries.sort((a, b) => {
        const [keyA] = a;
        const [keyB] = b;

        if (keyA.includes(keyB)) return -1;  // A includes B → A should come after
        else if (keyB.includes(keyA)) return 1; // B includes A → B should come after
        else return keyA.localeCompare(keyB); // Otherwise, sort alphabetically
    });

    return entries;
};


export const toFormula = (exp: SheetExpression, position: SheetPosition): string => {

    switch (typeof exp) {
        case "string":
            return toFormulaString(exp);
        case "number":
            return exp.toString();
        default:
            switch (exp.type) {
                case 'compare':
                    return `(${toFormula(exp.left, position)} ${exp.op} ${toFormula(exp.right, position)})`;
                case 'combine':
                    return `(${exp.items.map(item => toFormula(item, position)).join(exp.op)})`;
                case 'function':
                    return `${exp.name}(${exp.items.map(arg => toFormula(arg, position)).join(',')})`;
                case 'negate':
                    return `-(${toFormula(exp.item, position)})`;
                case 'selector':
                    return SheetSelector().toAddress(exp.selector, position);
                case 'template': {
                    let result = exp.text;

                    if (exp.vars) {
                        for (const [name, subexp] of substringSort(exp.vars)) {
                            const formula = toFormula(subexp, position);

                            result = result.replaceAll(name, formula);
                        }
                    }

                    return result;
                }
            }
    }
};
