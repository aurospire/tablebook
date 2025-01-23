import { TableTemporalFormat } from "../types";

export type LiteReference<T extends string = string> = `@${T}`;

export type LiteColumnSelector = { page?: string; group?: string; name: string; };

export type LiteUnitSelector = `${'$' | '+' | '-'}${number}`;

export type LiteRowSelector = LiteUnitSelector | { from: LiteUnitSelector, to: LiteUnitSelector; } | 'all';

export type LiteSelector = {
    column: LiteColumnSelector | 'self';
    rows: LiteRowSelector | 'self';
} | 'self';

export type LiteColor = `#${string}`;

export type LitePalette =
    'pink' | 'cranberry' | 'red' | 'rust' | 'orange' | 'yellow' |
    'green' | 'moss' | 'sage' | 'teal' | 'slate' | 'cyan' | 'blue' | 'azure' | 'skyblue' |
    'lavender' | 'indigo' | 'purple' | 'plum' | 'mauve' | 'coral' | 'terracotta' | 'bronze' |
    'sand' | 'taupe' | 'gray' | 'charcoal';

export type LiteLiteralExpression = { type: 'literal', of: string | number | boolean; };

export type LiteRawExpression = { type: 'raw', text: string, refs?: Record<string, LiteSelector>; };

export type LiteExpression = | LiteRawExpression | LiteLiteralExpression;


export type LiteTextTypeString = 'text';

export type LiteNumericTypeString = `('currency' | 'number' | 'percent')${`:${number}` | ''}`;
export const LiteNumericTypeStringRegex = /^(currency|number|percent)(?::([0-9]+))?$/;

export type LiteTemporalTypeString = `${'date' | 'datetime'}${`:${'iso' | 'text'}` | ''}`;
export const LiteTemporalTypeStringRegex = /^(date|datetime)(:(iso|text)|)$/;

export type LiteLookupTypeString = `lookup:${string}.${string}.${string}`;
export const LiteLookupTypeStringRegex = /^(lookup):([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)$/;


export type LiteTextType = LiteReference<LiteTextTypeString> | { kind: 'text'; };

export type LiteEnumItem = { name: string; description?: string; color: LiteColor; };

export type LiteEnumType = { kind: 'enum'; items: LiteEnumItem[]; };

export type LiteLookupType = LiteReference<LiteLookupTypeString> | { kind: 'lookup'; column: LiteColumnSelector; };

export type LiteNumericType = LiteReference<LiteNumericTypeString> | { kind: 'numeric'; format?: LiteReference<LiteNumericTypeString>; };

export type LiteTemporalType = LiteReference<LiteTemporalTypeString> | { kind: 'temporal'; format?: LiteReference<LiteTemporalTypeString>; };

export type LiteColumnType = LiteTextType | LiteEnumType | LiteLookupType | LiteNumericType | LiteTemporalType;


export type LiteUnit = { name: string; description?: string; };

export type LiteColumn = LiteUnit & { type: LiteColumnType | LiteReference; source?: string; expression?: LiteExpression; };

export type LiteGroup = LiteUnit & { columns: LiteColumn[]; };

export type LitePage = LiteUnit & { groups: LiteGroup[]; rows: number; theme: LiteReference<LitePalette>; };

export type LiteDefinitions = { types?: Record<string, LiteColumnType>; };

export type LiteBook = LiteUnit & { pages: LitePage[]; definitions?: LiteDefinitions; };
