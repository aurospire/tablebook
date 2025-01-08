import { SheetData, SheetValue } from "../sheets/SheetData";
import { toFormula } from "../sheets/SheetExpression";
import { SheetKind, toPattern } from "../sheets/SheetKind";
import { SheetPosition } from "../sheets/SheetPosition";
import { SheetAlign, SheetWrap } from "../sheets/SheetStyle";
import { toWeightedColorStyle } from "./GoogleStyles";
import { GoogleCellFormat, GoogleCellValue, GoogleNumberFormat, GoogleTextFormat } from "./GoogleTypes";

export const GoogleFieldMap: Record<string, string[]> = {
    back: ['userEnteredFormat.backgroundColorStyle'],
    fore: ['userEnteredFormat.textFormat.foregroundColorStyle'],
    bold: ['userEnteredFormat.textFormat.bold'],
    italic: ['userEnteredFormat.textFormat.italic'],
    horizontal: ['userEnteredFormat.horizontalAlignment'],
    vertical: ['userEnteredFormat.verticalAlignment'],
    wrap: ['userEnteredFormat.wrapStrategy'],
    kind: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    format: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    value: ['userEnteredValue'],
} satisfies Record<keyof SheetData, string[]>;

export const GoogleHorizontalAlignMap = {
    start: 'LEFT',
    middle: 'CENTER',
    end: 'RIGHT'
} satisfies Record<SheetAlign, string>;

export const GoogleVerticalAlignMap = {
    start: 'TOP',
    middle: 'MIDDLE',
    end: 'BOTTOM'
} satisfies Record<SheetAlign, string>;

export const GoogleWrapMap = {
    overflow: 'OVERFLOW_CELL',
    clip: 'CLIP',
    wrap: 'WRAP'
} satisfies Record<SheetWrap, string>;

export const GoogleCellTypeMap = {
    text: 'TEXT',
    number: 'NUMBER',
    percent: 'PERCENT',
    currency: 'CURRENCY',
    date: 'DATE',
    time: 'TIME',
    datetime: 'DATE_TIME',
} satisfies Record<SheetKind, string>;


export const getExtendedValue = (value: SheetValue, position: SheetPosition): GoogleCellValue | undefined => {
    switch (typeof value) {
        case 'string':
            return { stringValue: value };
        case 'number':
            return { numberValue: value };
        case 'boolean':
            return { boolValue: value };
        default:
            return { formulaValue: '=' + toFormula(value, position) };
    }
};

export const getFields = (from: string[] | SheetData): string[] => {
    const keys: string[] = Array.isArray(from) ? from : Object
        .entries(from)
        .filter(([_, v]) => v !== undefined)
        .map(([k]) => k);

    const fields = new Set<string>(keys.flatMap(key => GoogleFieldMap[key] ?? []));

    return [...fields];
};

export const toCellValue = (data: SheetData, position: SheetPosition<number>): GoogleCellValue | undefined => {
    if (data.value !== undefined) {
        if (data.value !== null)
            return getExtendedValue(data.value, position);
    }
};

export const toCellFormat = (data: SheetData): GoogleCellFormat | undefined => {
    let dataFormat: GoogleCellFormat | undefined;

    let textFormat: GoogleTextFormat | undefined;

    let numberFormat: GoogleNumberFormat | undefined;

    if (data) {
        if (data.back !== undefined) {
            if (data.back !== null) {
                dataFormat ??= {};
                dataFormat.backgroundColorStyle = toWeightedColorStyle(data.back);
            }
        }

        if (data.fore !== undefined) {
            if (data.fore !== null) {
                textFormat ??= {};
                textFormat.foregroundColorStyle = toWeightedColorStyle(data.fore);
            }
        }

        if (data.bold !== undefined) {
            if (data.bold !== null) {
                textFormat ??= {};
                textFormat.bold = data.bold;
            }
        }

        if (data.italic !== undefined) {
            if (data.italic !== null) {
                textFormat ??= {};
                textFormat.italic = data.italic;
            }
        }


        if (data.horizontal !== undefined) {
            if (data.horizontal !== null) {
                dataFormat ??= {};
                dataFormat.horizontalAlignment = GoogleHorizontalAlignMap[data.horizontal];
            }
        }

        if (data.vertical !== undefined) {
            if (data.vertical !== null) {
                dataFormat ??= {};
                dataFormat.verticalAlignment = GoogleVerticalAlignMap[data.vertical];
            }
        }

        if (data.wrap !== undefined) {
            if (data.wrap !== null) {
                dataFormat ??= {};
                dataFormat.wrapStrategy = GoogleWrapMap[data.wrap];
            }
        }

        if (data.kind !== undefined || data.format !== undefined) {
            if (data.kind !== null || data.format !== null) {
                numberFormat ??= {};
                numberFormat.type = data.kind ? GoogleCellTypeMap[data.kind] : GoogleCellTypeMap.text;
                numberFormat.pattern = data.format ? toPattern(data.format) : '';
            }
        }
    }

    if (textFormat || numberFormat)
        dataFormat = { ...(dataFormat ?? {}), textFormat, numberFormat };

    return dataFormat;
};
