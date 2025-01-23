export type LiteTableReference<T extends string = string> = `@${T}`;

export type LiteTableColumnSelector = { page?: string; group?: string; name: string; };

export type LiteTableUnitSelector = `${'$' | '+' | '-'}${number}`;

export type LiteTableRowSelector = LiteTableUnitSelector | { from: LiteTableUnitSelector, to: LiteTableUnitSelector; } | 'all';

export type LiteTableSelector = {
    column: LiteTableColumnSelector | 'self';
    rows: LiteTableRowSelector | 'self';
} | 'self';

export type LiteTableColor = `#${string}`;

export type LiteTablePalette =
    'pink' | 'cranberry' | 'red' | 'rust' | 'orange' | 'yellow' |
    'green' | 'moss' | 'sage' | 'teal' | 'slate' | 'cyan' | 'blue' | 'azure' | 'skyblue' |
    'lavender' | 'indigo' | 'purple' | 'plum' | 'mauve' | 'coral' | 'terracotta' | 'bronze' |
    'sand' | 'taupe' | 'gray' | 'charcoal';

export type LiteTableLiteralExpression = { type: 'literal', of: string | number | boolean; };

export type LiteTableRawExpression = { type: 'raw', text: string, refs?: Record<string, LiteTableSelector>; };


export type LiteTableExpression = | LiteTableRawExpression | LiteTableLiteralExpression;

export type LiteTableNumericFormat = 'currency' | `number:${number}` | `percent:${number}`;

export type LiteTableTemporalFormat = `${'date' | 'datetime'}${`:${'iso' | 'text'}` | ''}`;


export type LiteTableTextType = { kind: 'text'; };

export type LiteTableEnumItem = { name: string; description?: string; color: LiteTableColor; };

export type LiteTableEnumType = { kind: 'enum'; items: LiteTableEnumItem[]; };

export type LiteTableLookupType = { kind: 'lookup'; column: LiteTableColumnSelector; };

export type LiteTableNumericType = { kind: 'numeric'; format?: LiteTableReference<LiteTableNumericFormat>; };

export type LiteTableTemporalType = { kind: 'temporal'; format?: LiteTableReference<LiteTableTemporalFormat>; };


export type LiteTableColumnType = LiteTableTextType | LiteTableEnumType | LiteTableLookupType | LiteTableNumericType | LiteTableTemporalType;

export type LiteTableUnit = { name: string; description?: string; };

export type LiteTableColumn = LiteTableUnit & { type: LiteTableColumnType | LiteTableReference; source?: string; expression?: LiteTableExpression; };

export type LiteTableGroup = LiteTableUnit & { columns: LiteTableColumn[]; };

export type LiteTablePage = LiteTableUnit & { groups: LiteTableGroup[]; rows: number; theme: LiteTableReference<LiteTablePalette>; };

export type LiteTableDefinitions = { types?: Record<string, LiteTableColumnType>; };

export type LiteTableBook = LiteTableUnit & { pages: LiteTablePage[]; definitions?: LiteTableDefinitions; };