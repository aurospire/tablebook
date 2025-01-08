import { BaseNumberFormat, DigitPlaceholder, NumericFormat, TemporalFormat, TemporalUnitLength, TemporalUnitType } from "../tables/types";

export type SheetKind = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetType = {
    kind?: SheetKind | null;
    format?: NumericFormat | TemporalFormat | null;
};

const processDigitPlaceholder = (digits: number | DigitPlaceholder | undefined, reversed: boolean): string | undefined => {
    if (!digits) return undefined;

    if (typeof digits === 'number')
        return '0'.repeat(digits);

    const align = '?'.repeat(digits.align ?? 0);
    const fixed = '0'.repeat(digits.fixed ?? 0);
    const flex = '#'.repeat(digits.flex ?? 0);

    return reversed ? align + fixed + flex : flex + fixed + align;
};

const processBaseNumber = (format: BaseNumberFormat<string>) => {
    let result = '';

    result = processDigitPlaceholder(format.integer, false) ?? '#';

    if (format.commas) {
        result = result.padStart(2, '#');
        result.slice(0, -2) + ',' + result.slice(-1);
    }

    if (format.decimal)
        result += '.' + processDigitPlaceholder(format.decimal, true);

    console.log(result);
    return result;
};

export const temporalTable: Record<string, string> = {
    yearlong: 'yyyy',
    yearshort: 'yy',
    monthlong: 'mm',
    monthshort: 'm',
    monthnamelong: 'mmmm',
    monthnameshort: 'mmm',
    daylong: 'dd',
    dayshort: 'd',
    weekdaylong: 'dddd',
    weekdayshort: 'ddd',
    hourlong: 'hh',
    hourshort: 'h',
    minutelong: 'mm',
    minuteshort: 'm',
    secondlong: 'ss',
    secondshort: 's',
    meridiemlong: 'AM/PM',
    meridiemshort: 'a/p',
} satisfies Record<`${TemporalUnitType}${TemporalUnitLength}`, string>;

export const toPattern = (format: NumericFormat | TemporalFormat): string => {
    if (Array.isArray(format)) {
        return format.map(item => {
            return typeof item === 'string' ? `"${item}"` : temporalTable[item.type + item.length];
        }).join('');
    }
    else {
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
        }
    }
};