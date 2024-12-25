import { UnitSelector, Expression, UnitSelectorRegex } from "../tables/types";
import { SheetRange, SheetPosition } from "./SheetPosition";


export type SheetRangeSelector = SheetRange<UnitSelector>;

export type SheetExpression = Expression<SheetRangeSelector>;


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

const charCodeA = 'A'.charCodeAt(0);

const letterfy = (value: number): string => {
    let result = '';

    do {
        result = String.fromCharCode(charCodeA + (value % 26 | 0)) + result;

        value = value / 26 | 0;
    } while (value);

    return result;
};

const modifyUnitSelector = (offset: UnitSelector | undefined | null, current: number, letter: boolean): string => {
    let base = '';

    let [_, type, number] = offset?.match(UnitSelectorRegex) ?? [];

    let value = Number(number ?? 0);

    if (type === '$')
        base = '$';
    else if (type === '-')
        value = current - value;

    else
        value = current + value;

    return base + (letter ? letterfy(value) : (value + 1).toString());
};

const toAddress = (selector: SheetRangeSelector | null, position: SheetPosition): string => {
    const col = modifyUnitSelector(selector?.start.col, position.col, true);

    const row = modifyUnitSelector(selector?.start.row, position.row, false);

    return col + row;
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
                    return toAddress(null, position);
                case 'selector':
                    return toAddress(exp.from, position);
            }
    }
};
