import { z } from 'zod';
import {
    TableAllLiteral,
    TableAllSelector,
    TableBook,
    TableBorder, TableBorderType, TableBorderTypes,
    TableColor,
    TableColorRegex,
    TableColumn,
    TableColumnSelector,
    TableColumnType,
    TableComparisonOperator,
    TableComparisonOperators,
    TableCompoundExpression, TableCompoundExpressionType,
    TableCurrencyFormat, TableCurrencyFormatType, TableCurrencySymbolPositions,
    TableCustomRule, TableCustomRuleType,
    TableDefinitions,
    TableDigitPlaceholder,
    TableEnumItem, TableEnumType, TableEnumTypeKind,
    TableExpression,
    TableFunctionExpression, TableFunctionExpressionType,
    TableGroup,
    TableHeaderStyle,
    TableLiteralExpression,
    TableLiteralExpressionType,
    TableLookupType, TableLookupTypeKind,
    TableMatchOperators,
    TableMatchRule,
    TableMergeOperator, TableMergeOperators,
    TableNegatedExpression, TableNegatedExpressionType,
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
    TableRawExpression,
    TableRawExpressionType,
    TableReference, TableReferenceRegex,
    TableRowSelector,
    TableSelector,
    TableSelectorExpression, TableSelectorExpressionType,
    TableSelfLiteral, TableSelfSelector,
    TableStyle,
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
const TableReference: z.ZodType<TableReference> = z.custom<TableReference>(value => TableReferenceRegex.test(value as string));

/* Data Reference */
const TableSelfSelector: z.ZodType<TableSelfSelector> = z.literal(TableSelfLiteral);

const TableColumnSelector: z.ZodType<TableColumnSelector> = z.object({
    page: z.string().optional(),
    group: z.string().optional(),
    name: z.string()
});

const TableUnitSelector: z.ZodType<TableUnitSelector> = z.custom<TableUnitSelector>(value => TableUnitSelectorRegex.test(value as string));

const TableRangeSelector: z.ZodType<TableRangeSelector> = z.object({
    from: TableUnitSelector,
    to: TableUnitSelector
});

const TableAllSelector: z.ZodType<TableAllSelector> = z.literal(TableAllLiteral);

const TableRowSelector: z.ZodType<TableRowSelector> = z.union([TableUnitSelector, TableRangeSelector]);

const TableDataSelector: z.ZodType<TableSelector> = z.union([
    TableSelfSelector,
    z.object({
        column: z.union([TableColumnSelector, TableSelfSelector]),
        rows: z.union([TableRowSelector, TableSelfSelector, TableAllSelector])
    })
]);

/* Styling */
const TableColor: z.ZodType<TableColor> = z.custom(value => TableColorRegex.test(value as string));


const TableColorReference = z.union([TableColor, TableReference]);

const TableStyle: z.ZodType<TableStyle> = z.object({
    fore: TableColorReference.optional(),
    back: TableColorReference.optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional()
});

const TableBorderType: z.ZodType<TableBorderType> = z.enum(TableBorderTypes);

const TableBorder: z.ZodType<TableBorder> = z.object({
    type: TableBorderType,
    color: TableColorReference,
});

const TablePartition: z.ZodType<TablePartition> = z.object({
    beneath: TableBorder.optional(),
    between: TableBorder.optional()
});

const TableHeaderStyle: z.ZodType<TableHeaderStyle> = TableStyle.and(TablePartition);

const TableHeaderStyleReference = z.union([TableHeaderStyle, TableReference]);
const TableStyleReference = z.union([TableStyle, TableReference]);

const TableTheme: z.ZodType<TableTheme> = z.object({
    inherits: z.array(TableReference).optional(),
    tab: TableColorReference.optional(),
    group: TableHeaderStyleReference.optional(),
    header: TableHeaderStyleReference.optional(),
    data: TableStyleReference.optional(),
});

/* Operators */
const TableComparisonOperator: z.ZodType<TableComparisonOperator> = z.enum(TableComparisonOperators);
const TableMergeOperator: z.ZodType<TableMergeOperator> = z.enum(TableMergeOperators);

/* Expressions */
const TableCompoundExpression: z.ZodType<TableCompoundExpression<TableSelector>> = z.object({
    type: z.literal(TableCompoundExpressionType),
    with: z.union([TableComparisonOperator, TableMergeOperator]),
    items: z.array(z.lazy(() => TableExpression))
});

const TableNegatedExpression: z.ZodType<TableNegatedExpression<TableSelector>> = z.object({
    type: z.literal(TableNegatedExpressionType),
    on: z.lazy(() => TableExpression)
});

const TableFunctionExpression: z.ZodType<TableFunctionExpression<TableSelector>> = z.object({
    type: z.literal(TableFunctionExpressionType),
    name: z.string().transform(value => value.toUpperCase()),
    args: z.array(z.lazy(() => TableExpression))
});

const TableLiteralExpression: z.ZodType<TableLiteralExpression> = z.object({
    type: z.literal(TableLiteralExpressionType),
    of: z.union([z.string(), z.number(), z.boolean()])
});

const TableSelectorExpression: z.ZodType<TableSelectorExpression<TableSelector>> = z.object({
    type: z.literal(TableSelectorExpressionType),
    from: TableDataSelector
});

const TableRawExpression: z.ZodType<TableRawExpression<TableSelector>> = z.object({
    type: z.literal(TableRawExpressionType),
    text: z.string(),
    refs: z.record(z.string(), TableDataSelector)
});

const TableExpression: z.ZodType<TableExpression<TableSelector>> = z.union([
    TableCompoundExpression,
    TableNegatedExpression,
    TableFunctionExpression,
    TableLiteralExpression,
    TableSelectorExpression,
    TableRawExpression
]);

/* Data Rules */
const TableTemporalString: z.ZodType<TableTemporalString> = z.custom(value => TableTemporalStringRegex.test(value as string));

const makeValueRules = <T>(type: z.ZodType<T>) => {
    const comparison = z.object({
        type: TableComparisonOperator,
        value: type
    });

    const between = z.object({
        type: z.enum(TableRangeOperators),
        low: type,
        high: type
    }) as z.ZodType<TableRangeRule<T>>;

    return z.union([comparison, between]);
};

const TableMatchRule: z.ZodType<TableMatchRule> = z.object({
    type: z.enum(TableMatchOperators),
    value: z.string()
});

const TableCustomRule: z.ZodType<TableCustomRule> = z.object({
    type: z.literal(TableCustomRuleType),
    expression: TableExpression
});

const TableNumericRule: z.ZodType<TableNumericRule> = z.union([makeValueRules(z.number()), TableCustomRule]);
const TableTemporalRule: z.ZodType<TableTemporalRule> = z.union([makeValueRules(TableTemporalString), TableCustomRule]);
const TableTextRule: z.ZodType<TableTextRule> = z.union([TableMatchRule, TableCustomRule]);

const makeConditionalStyle = <Rule extends z.ZodType<any>>(rule: Rule) => {
    return z.object({
        rule: rule,
        apply: TableStyleReference
    });
};

const TableTextConditionalStyle = makeConditionalStyle(TableTextRule);
const TableNumericConditionalStyle = makeConditionalStyle(TableNumericRule);
const TableTemporalConditionalStyle = makeConditionalStyle(TableTemporalRule);

/* Numeric Formats */
const TableDigitPlaceholder: z.ZodType<TableDigitPlaceholder> = z.object({
    fixed: z.number().int().min(0).optional(),
    flex: z.number().int().min(0).optional(),
    align: z.number().int().min(0).optional(),
});

const TableNumberOrDigitPlaceholder = z.union([z.number(), TableDigitPlaceholder]);

const makeNumberFormat = <Type extends string>(type: Type) => {
    return z.object({
        type: z.literal(type),
        integer: TableNumberOrDigitPlaceholder.optional(),
        decimal: TableNumberOrDigitPlaceholder.optional(),
        commas: z.boolean().optional(),
    });
};

const TableNumberFormat: z.ZodType<TableNumberFormat> = makeNumberFormat(TableNumberFormatType);
const TablePercentFormat: z.ZodType<TablePercentFormat> = makeNumberFormat(TablePercentFormatType);
const TableCurrencyFormat: z.ZodType<TableCurrencyFormat> = makeNumberFormat(TableCurrencyFormatType).and(z.object({
    symbol: z.string().optional(),
    position: z.enum(TableCurrencySymbolPositions).optional()
}));

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
});

const TableTemporalItem: z.ZodType<TableTemporalItem> = z.union([TableTemporalUnit, z.string()]);
const TableTemporalFormat: z.ZodType<TableTemporalFormat> = z.array(TableTemporalItem);

/* Data Types */
const TableTextType: z.ZodType<TableTextType> = z.object({
    kind: z.literal(TableTextTypeKind),
    rule: TableTextRule.optional(),
    styles: z.array(TableTextConditionalStyle).optional()
});

const TableEnumItem: z.ZodType<TableEnumItem> = z.object({
    name: z.string(),
    description: z.string().optional(),
    style: TableStyleReference.optional(),
    color: TableColorReference.optional()
});

const TableEnumType: z.ZodType<TableEnumType> = z.object({
    kind: z.literal(TableEnumTypeKind),
    items: z.array(TableEnumItem)
});

const TableLookupType: z.ZodType<TableLookupType> = z.object({
    kind: z.literal(TableLookupTypeKind),
    column: TableColumnSelector
});

const TableNumericType: z.ZodType<TableNumericType> = z.object({
    kind: z.literal(TableNumericTypeKind),
    rule: TableNumericRule.optional(),
    styles: z.array(TableNumericConditionalStyle).optional(),
    format: z.union([TableNumericFormat, TableReference]).optional()
});

const TableTemporalType: z.ZodType<TableTemporalType> = z.object({
    kind: z.literal(TableTemporalTypeKind),
    rule: TableTemporalRule.optional(),
    styles: z.array(TableTemporalConditionalStyle).optional(),
    format: z.union([TableTemporalFormat, TableReference]).optional()
});



const TableColumnType: z.ZodType<TableColumnType> = z.union([
    TableTextType,
    TableEnumType,
    TableLookupType,
    TableNumericType,
    TableTemporalType,
]);

/* Table Structures */
const TableUnit: z.ZodType<TableUnit> = z.object({
    name: z.string().regex(TableUnitNameRegex),
    theme: z.union([TableTheme, TableReference]).optional(),
    description: z.string().optional()
});

const TableColumn: z.ZodType<TableColumn> = TableUnit.and(z.object({
    type: z.union([TableColumnType, TableReference]),
    source: z.string().optional(),
    expression: TableExpression.optional(),
}));

const TableGroup: z.ZodType<TableGroup> = TableUnit.and(z.object({
    columns: z.array(TableColumn).min(1)
}));

const TablePage: z.ZodType<TablePage> = TableUnit.and(z.object({
    groups: z.array(TableGroup).min(1),
    rows: z.number().int().positive()
}));

const TableDefinitions: z.ZodType<TableDefinitions> = z.object({
    colors: z.record(z.string(), z.union([TableColor, TableReference])).optional(),
    styles: z.record(z.string(), z.union([TableHeaderStyle, TableReference])).optional(),
    themes: z.record(z.string(), z.union([TableTheme, TableReference])).optional(),
    numerics: z.record(z.string(), z.union([TableNumericFormat, TableReference])).optional(),
    temporals: z.record(z.string(), z.union([TableTemporalFormat, TableReference])).optional(),
    types: z.record(z.string(), z.union([TableColumnType, TableReference])).optional()
});

const TableBook: z.ZodType<TableBook> = TableUnit.and(z.object({
    pages: z.array(TablePage),
    definitions: TableDefinitions.optional()
}));

export { TableBook as TableBookValidator };
