import { SheetAlign, SheetWrap, SheetData } from "../SheetData";
import { SheetType } from "../SheetKind";

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
} satisfies Record<SheetType, string>;

export const GoogleFieldMap: Record<string, string[]> = {
    back: ['userEnteredFormat.backgroundColorStyle'],
    fore: ['userEnteredFormat.textFormat.foregroundColorStyle'],
    bold: ['userEnteredFormat.textFormat.bold'],
    italic: ['userEnteredFormat.textFormat.italic'],
    horizontal: ['userEnteredFormat.horizontalAlignment'],
    vertical: ['userEnteredFormat.verticalAlignment'],
    wrap: ['userEnteredFormat.wrapStrategy'],
    type: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    format: ['userEnteredFormat.numberFormat.type', 'userEnteredFormat.numberFormat.pattern'],
    value: ['userEnteredValue'],
} satisfies Record<keyof SheetData, string[]>;



export const GoogleConditionType = [
'NUMBER_GREATER',
'NUMBER_GREATER_THAN_EQ',
'NUMBER_LESS',
'NUMBER_GREATER_THAN_EQ',
'NUMBER_EQ',
'NUMBER_NOT_EQ',
'NUMBER_BETWEEN',

'TEXT'
] as const;