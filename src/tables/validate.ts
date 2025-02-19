import { z } from 'zod';
import {
    TableAllLiteral,
    TableAllSelector,
    TableBook,
    TableBorder, TableBorderType, TableBorderTypes,
    TableColor,
    TableColorRegex,
    TableColumn,
    TableColumnList,
    TableColumnSelector,
    TableCombineExpression, TableCombineExpressionType,
    TableCombineOperator, TableCombineOperators,
    TableCompareExpression,
    TableCompareExpressionType,
    TableCompareOperator,
    TableCompareOperators,
    TableCurrencyFormat, TableCurrencyFormatType, TableCurrencySymbolPositions,
    TableCustomRule, TableCustomRuleType,
    TableDataType,
    TableDefinitions,
    TableDigitPlaceholder,
    TableEnumItem, TableEnumType, TableEnumTypeKind,
    TableExpression,
    TableFunctionExpression, TableFunctionExpressionType,
    TableGroup,
    TableHeaderStyle,
    TableLiteralExpression,
    TableLookupType, TableLookupTypeKind,
    TableMatchOperators,
    TableMatchRule,
    TableNegateExpression, TableNegateExpressionType,
    TableNumberFormat, TableNumberFormatType,
    TableNumericFormat,
    TableNumericRule,
    TableNumericType, TableNumericTypeKind,
    TablePage,
    TablePartition,
    TablePercentFormat, TablePercentFormatType,
    TableRangeOperators,
    TableRangeRule,
    TableRangeSelector,
    TableReference, TableReferenceRegex,
    TableRowSelector,
    TableSelector,
    TableSelectorExpression, TableSelectorExpressionType,
    TableSelfLiteral, TableSelfSelector,
    TableStyle,
    TableTemplateExpression,
    TableTemplateExpressionType,
    TableTemporalFormat,
    TableTemporalItem,
    TableTemporalRule,
    TableTemporalString,
    TableTemporalStringRegex,
    TableTemporalType, TableTemporalTypeKind,
    TableTemporalUnit,
    TableTemporalUnitLength, TableTemporalUnitLengths,
    TableTemporalUnitType, TableTemporalUnitTypes,
    TableTextRule,
    TableTextType, TableTextTypeKind,
    TableTheme,
    TableUnit, TableUnitNameRegex,
    TableUnitSelector, TableUnitSelectorRegex
} from './types';


/* Reference */
const TableReference: z.ZodType<TableReference> = z.custom<TableReference>(
    value => TableReferenceRegex.test(value as string),
    { message: `Table reference must match regex ${TableReferenceRegex}` }
);

/* Data Reference */
const TableSelfSelector: z.ZodType<TableSelfSelector> = z.literal(TableSelfLiteral);

const TableColumnSelector: z.ZodType<TableColumnSelector> = z.object({
    page: z.string().optional(),
    group: z.string().optional(),
    name: z.string()
}).strict();

const TableUnitSelector: z.ZodType<TableUnitSelector> = z.custom<TableUnitSelector>(value => TableUnitSelectorRegex.test(value as string));

const TableRangeSelector: z.ZodType<TableRangeSelector> = z.object({
    from: TableUnitSelector,
    to: TableUnitSelector
}).strict();

const TableAllSelector: z.ZodType<TableAllSelector> = z.literal(TableAllLiteral);

const TableRowSelector: z.ZodType<TableRowSelector> = z.union([TableUnitSelector, TableRangeSelector]);

const TableDataSelector: z.ZodType<TableSelector> = z.union([
    TableSelfSelector,
    z.object({
        column: z.union([TableColumnSelector, TableSelfSelector]),
        rows: z.union([TableRowSelector, TableSelfSelector, TableAllSelector])
    }).strict()
]);

/* Styling */
const TableColor: z.ZodType<TableColor> = z.custom(
    value => TableColorRegex.test(value as string),
    { message: `Color must match regex ${TableColorRegex}` }
);


const TableColorReference = z.union([TableColor, TableReference]);

const TableStyle = z.object({
    fore: TableColorReference.optional(),
    back: TableColorReference.optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional()
}).strict();

const TableBorderType: z.ZodType<TableBorderType> = z.enum(TableBorderTypes);

const TableBorder: z.ZodType<TableBorder> = z.object({
    type: TableBorderType,
    color: TableColorReference,
}).strict();

const TablePartition = z.object({
    beneath: TableBorder.optional(),
    between: TableBorder.optional()
}).strict();

const TableHeaderStyle: z.ZodType<TableHeaderStyle> = TableStyle.merge(TablePartition);

const TableHeaderStyleReference = z.union([TableHeaderStyle, TableReference]);
const TableStyleReference = z.union([TableStyle, TableReference]);

const TableTheme: z.ZodType<TableTheme> = z.object({
    inherits: z.array(TableReference).optional(),
    tab: TableColorReference.optional(),
    group: TableHeaderStyleReference.optional(),
    header: TableHeaderStyleReference.optional(),
    data: TableStyleReference.optional(),
}).strict();

/* Operators */
const TableCompareOperator: z.ZodType<TableCompareOperator> = z.enum(TableCompareOperators);
const TableCombineOperator: z.ZodType<TableCombineOperator> = z.enum(TableCombineOperators);

/* Expressions */
const TableLiteralExpression: z.ZodType<TableLiteralExpression> = z.union([z.string(), z.number()]);

const TableSelectorExpression: z.ZodType<TableSelectorExpression> = z.object({
    type: z.literal(TableSelectorExpressionType),
    selector: TableDataSelector
}).strict();

const TableFunctionExpression: z.ZodType<TableFunctionExpression> = z.object({
    type: z.literal(TableFunctionExpressionType),
    name: z.string().transform(value => value.toUpperCase()),
    items: z.array(z.lazy(() => TableExpression))
}).strict();

const TableCompareExpression: z.ZodType<TableCompareExpression> = z.object({
    type: z.literal(TableCompareExpressionType),
    op: TableCompareOperator,
    left: z.lazy(() => TableExpression),
    right: z.lazy(() => TableExpression)
}).strict();

const TableCombineExpression: z.ZodType<TableCombineExpression> = z.object({
    type: z.literal(TableCombineExpressionType),
    op: TableCombineOperator,
    items: z.array(z.lazy(() => TableExpression))
}).strict();

const TableNegateExpression: z.ZodType<TableNegateExpression> = z.object({
    type: z.literal(TableNegateExpressionType),
    item: z.lazy(() => TableExpression)
}).strict();

const TableTemplateExpression: z.ZodType<TableTemplateExpression> = z.object({
    type: z.literal(TableTemplateExpressionType),
    text: z.string(),
    vars: z.record(z.string(), z.lazy(() => TableExpression)).optional()
}).strict();

const TableExpression: z.ZodType<TableExpression> = z.union([
    TableLiteralExpression,
    TableSelectorExpression,
    TableFunctionExpression,
    TableCompareExpression,
    TableCombineExpression,
    TableNegateExpression,
    TableTemplateExpression
]);

/* Data Rules */
const TableTemporalString: z.ZodType<TableTemporalString> = z.custom(
    value => TableTemporalStringRegex.test(value as string),
    { message: `Temporal string must match regex ${TableTemporalStringRegex}` }
);

const makeValueRules = <T>(type: z.ZodType<T>) => {
    const comparison = z.object({
        type: TableCompareOperator,
        value: type
    }).strict();

    const between = z.object({
        type: z.enum(TableRangeOperators),
        low: type,
        high: type
    }).strict() as z.ZodType<TableRangeRule<T>>;

    return z.union([comparison, between]);
};

const TableMatchRule: z.ZodType<TableMatchRule> = z.object({
    type: z.enum(TableMatchOperators),
    value: z.string()
}).strict();

const TableCustomRule: z.ZodType<TableCustomRule> = z.object({
    type: z.literal(TableCustomRuleType),
    expression: TableExpression
}).strict();

const TableNumericRule: z.ZodType<TableNumericRule> = z.union([makeValueRules(z.number()), TableCustomRule]);
const TableTemporalRule: z.ZodType<TableTemporalRule> = z.union([makeValueRules(TableTemporalString), TableCustomRule]);
const TableTextRule: z.ZodType<TableTextRule> = z.union([TableMatchRule, TableCustomRule]);

const makeConditionalStyle = <Rule extends z.ZodType<any>>(rule: Rule) => {
    return z.object({
        when: rule,
        style: TableStyleReference.optional(),
        color: TableColorReference.optional()
    }).strict();
};

const TableTextConditionalStyle = makeConditionalStyle(TableTextRule);
const TableNumericConditionalStyle = makeConditionalStyle(TableNumericRule);
const TableTemporalConditionalStyle = makeConditionalStyle(TableTemporalRule);

/* Numeric Formats */
const TableDigitPlaceholder: z.ZodType<TableDigitPlaceholder> = z.object({
    fixed: z.number().int().min(0).optional(),
    flex: z.number().int().min(0).optional(),
    align: z.number().int().min(0).optional(),
}).strict();

const TableNumberOrDigitPlaceholder = z.union([z.number(), TableDigitPlaceholder]);

const makeNumberFormat = <Type extends string>(type: Type) => {
    return z.object({
        type: z.literal(type),
        integer: TableNumberOrDigitPlaceholder.optional(),
        decimal: TableNumberOrDigitPlaceholder.optional(),
        commas: z.boolean().optional(),
    });
};

const TableNumberFormat: z.ZodType<TableNumberFormat> = makeNumberFormat(TableNumberFormatType).strict();
const TablePercentFormat: z.ZodType<TablePercentFormat> = makeNumberFormat(TablePercentFormatType).strict();
const TableCurrencyFormat: z.ZodType<TableCurrencyFormat> = makeNumberFormat(TableCurrencyFormatType).merge(z.object({
    symbol: z.string().optional(),
    position: z.enum(TableCurrencySymbolPositions).optional()
}).strict());

const TableNumericFormat: z.ZodType<TableNumericFormat> = z.union([
    TableNumberFormat,
    TablePercentFormat,
    TableCurrencyFormat
]);

/* Temporal Format */
const TableTemporalUnitLength: z.ZodType<TableTemporalUnitLength> = z.enum(TableTemporalUnitLengths);
const TableTemporalUnitType: z.ZodType<TableTemporalUnitType> = z.enum(TableTemporalUnitTypes);
const TableTemporalUnit: z.ZodType<TableTemporalUnit> = z.object({
    type: TableTemporalUnitType,
    length: TableTemporalUnitLength
}).strict();

const TableTemporalItem: z.ZodType<TableTemporalItem> = z.union([TableTemporalUnit, z.string()]);
const TableTemporalFormat: z.ZodType<TableTemporalFormat> = z.array(TableTemporalItem);

/* Data Types */
const TableTextType: z.ZodType<TableTextType> = z.object({
    kind: z.literal(TableTextTypeKind),
    rule: TableTextRule.optional(),
    style: TableStyleReference.optional(),
    styles: z.array(TableTextConditionalStyle).optional()
}).strict();

const TableEnumItem: z.ZodType<TableEnumItem> = z.object({
    name: z.string(),
    description: z.string().optional(),
    style: TableStyleReference.optional(),
    color: TableColorReference.optional()
}).strict();

const TableEnumType: z.ZodType<TableEnumType> = z.object({
    kind: z.literal(TableEnumTypeKind),
    style: TableStyleReference.optional(),
    styles: z.array(TableTextConditionalStyle).optional(),
    items: z.array(TableEnumItem)
}).strict();

const TableLookupType: z.ZodType<TableLookupType> = z.object({
    kind: z.literal(TableLookupTypeKind),
    style: TableStyleReference.optional(),
    styles: z.array(TableTextConditionalStyle).optional(),
    column: TableColumnSelector
}).strict();

const TableNumericType: z.ZodType<TableNumericType> = z.object({
    kind: z.literal(TableNumericTypeKind),
    style: TableStyleReference.optional(),
    styles: z.array(TableNumericConditionalStyle).optional(),
    rule: TableNumericRule.optional(),
    format: z.union([TableNumericFormat, TableReference]).optional()
}).strict();

const TableTemporalType: z.ZodType<TableTemporalType> = z.object({
    kind: z.literal(TableTemporalTypeKind),
    style: TableStyleReference.optional(),
    styles: z.array(TableTemporalConditionalStyle).optional(),
    rule: TableTemporalRule.optional(),
    format: z.union([TableTemporalFormat, TableReference]).optional()
}).strict();


const TableDataType: z.ZodType<TableDataType> = z.union([
    TableTextType,
    TableEnumType,
    TableLookupType,
    TableNumericType,
    TableTemporalType,
]);

/* Table Structures */
const TableDefinitions: z.ZodType<TableDefinitions> = z.object({
    colors: z.record(z.string(), z.union([TableColor, TableReference])).optional(),
    styles: z.record(z.string(), z.union([TableHeaderStyle, TableReference])).optional(),
    themes: z.record(z.string(), z.union([TableTheme, TableReference])).optional(),
    numerics: z.record(z.string(), z.union([TableNumericFormat, TableReference])).optional(),
    temporals: z.record(z.string(), z.union([TableTemporalFormat, TableReference])).optional(),
    types: z.record(z.string(), z.union([TableDataType, TableReference])).optional()
}).strict();

const TableUnit = z.object({
    name: z.string().regex(TableUnitNameRegex, `Unit name must match regex ${TableUnitNameRegex}`),
    theme: z.union([TableTheme, TableReference]).optional(),
    description: z.string().optional(),
    definitions: TableDefinitions.optional()
}).strict();

type TableValues =
    | TableExpression<TableSelector> // One expression for all rows
    | TableExpression<TableSelector>[] // Explicit values for specific rows
    | {
        /** Explicitly assigned values for specific row indices */
        items?: TableExpression<TableSelector>[];
        /** Default expression for all rows not covered by `items` */
        rest?: TableExpression<TableSelector>;
    };

const TableValues = z.union([
    TableExpression,
    z.array(TableExpression),
    z.object({
        items: z.array(TableExpression).optional(),
        rest: TableExpression.optional()
    }).strict()]);

const TableColumn: z.ZodType<TableColumn> = TableUnit.merge(z.object({
    type: z.union([TableDataType, TableReference]),
    source: z.string().optional(),
    values: TableValues.optional()
})).strict();

const TableColumnList = z.object({
    columns: z.array(TableColumn).min(1),
}).strict();

const TableGroup: z.ZodType<TableGroup> = TableUnit.merge(TableColumnList).strict();

const TablePage: z.ZodType<TablePage> = TableUnit.merge(z.object({
    schema: z.union([TableColumnList, z.array(TableGroup).min(1)]),
    rows: z.number().int().gt(0),
})).strict();


const TableBook: z.ZodType<TableBook> = TableUnit.merge(z.object({
    pages: z.array(TablePage),
})).strict();

export { TableBook as TableBookValidator };
