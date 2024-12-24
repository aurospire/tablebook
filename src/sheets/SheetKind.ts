import { BaseNumberFormat, DigitPlaceholder, NumericFormat } from "../tables/types";


export type SheetType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetKind = {
    type?: SheetType | null;
    format?: string | null;
};

const processDigitPlaceholder = (digits: number | DigitPlaceholder | undefined, reversed: boolean): string => {
    if (!digits) return '';

    if (typeof digits === 'number')
        return '0'.repeat(digits);

    const align = '?'.repeat(digits.align ?? 0);
    const fixed = '0'.repeat(digits.fixed ?? 0);
    const flex = '#'.repeat(digits.flex ?? 0);

    return reversed ? align + fixed + flex : flex + fixed + align;
};

const processBaseNumber = (format: BaseNumberFormat<string>) => {
    let result = '';

    result = processDigitPlaceholder(format.integer, false);

    if (format.commas) {
        result = result.padStart(2, '#');
        result.slice(0, -2) + ',' + result.slice(-1);
    }

    if (format.decimal)
        result += '.' + processDigitPlaceholder(format.decimal, true);

    return result;
};

export const toPattern = (format: NumericFormat): string => {
    switch (format.type) {
        case 'number':
            return processBaseNumber(format);
        case 'percent':
            return processBaseNumber(format) + '%';
        case 'currency': {
            const symbol = format.symbol ?? '$';
            const pattern = processBaseNumber(format);
            return format.position === 'suffix' ? pattern + symbol : symbol + pattern;
        }
        case 'numberdate':         
        case 'textdate':
        case 'time':
        case 'datetime':
    }
    return '';
};