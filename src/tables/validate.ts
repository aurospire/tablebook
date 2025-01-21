import { z } from 'zod';
import {
    TableBorder, TableBorderType, TableBorderTypes,
    TableColor,
    TableColorRegex,
    TableColumnSelector,
    TableColumnType,
    TableComparisonOperator,
    TableComparisonOperators,
    TableCompoundExpression, TableCompoundExpressionType,
    TableCurrencyFormat, TableCurrencyFormatType, TableCurrencySymbolPositions,
    TableCustomRule, TableCustomRuleType,
    TableSelector,
    TableDefinitions,
    TableDigitPlaceholder,
    TableEnumItem, TableEnumType, TableEnumTypeKind,
    TableExpression,
    TableFunctionExpression, TableFunctionExpressionType,
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
    TablePartition,
    TablePercentFormat, TablePercentFormatType,
    TableRangeOperators,
    TableRangeSelector,
    TableRangeRule,
    TableReference, TableReferenceRegex,
    TableRowSelector,
    TableSelectorExpression, TableSelectorExpressionType,
    TableSelfLiteral, TableSelfSelector,
    TableStyle,
    TableBook, TableColumn,
    TableGroup, TablePage,
    TableUnit, TableUnitNameRegex,
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
    TableUnitSelector, TableUnitSelectorRegex,
    TableAllLiteral,
    TableAllSelector,
    TableRawExpressionType,
    TableRawExpression
} from './types';

/* Reference */
const Reference: z.ZodType<TableReference> = z.custom<TableReference>(value => TableReferenceRegex.test(value as string));

/* Data Reference */
const SelfSelector: z.ZodType<TableSelfSelector> = z.literal(TableSelfLiteral);

const ColumnSelector: z.ZodType<TableColumnSelector> = z.object({
    page: z.string().optional(),
    group: z.string().optional(),
    name: z.string()
});

const UnitSelector: z.ZodType<TableUnitSelector> = z.custom<TableUnitSelector>(value => TableUnitSelectorRegex.test(value as string));

const RangeSelector: z.ZodType<TableRangeSelector> = z.object({
    from: UnitSelector,
    to: UnitSelector
});

const AllSelector: z.ZodType<TableAllSelector> = z.literal(TableAllLiteral);

const RowSelector: z.ZodType<TableRowSelector> = z.union([UnitSelector, RangeSelector]);

const DataSelector: z.ZodType<TableSelector> = z.union([
    SelfSelector,
    z.object({
        column: z.union([ColumnSelector, SelfSelector]),
        rows: z.union([RowSelector, SelfSelector, AllSelector])
    })
]);

/* Styling */
const Color: z.ZodType<TableColor> = z.custom(value => TableColorRegex.test(value as string));


const ColorReference = z.union([Color, Reference]);

const Style: z.ZodType<TableStyle> = z.object({
    fore: ColorReference.optional(),
    back: ColorReference.optional(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional()
});

const BorderType: z.ZodType<TableBorderType> = z.enum(TableBorderTypes);

const Border: z.ZodType<TableBorder> = z.object({
    type: BorderType,
    color: ColorReference,
});

const Partition: z.ZodType<TablePartition> = z.object({
    beneath: Border.optional(),
    between: Border.optional()
});

const HeaderStyle: z.ZodType<TableHeaderStyle> = Style.and(Partition);

const HeaderStyleReference = z.union([HeaderStyle, Reference]);
const StyleReference = z.union([Style, Reference]);

const Theme: z.ZodType<TableTheme> = z.object({
    inherits: z.array(Reference).optional(),
    tab: ColorReference.optional(),
    group: HeaderStyleReference.optional(),
    header: HeaderStyleReference.optional(),
    data: StyleReference.optional(),
});

/* Operators */
const ComparisonOperator: z.ZodType<TableComparisonOperator> = z.enum(TableComparisonOperators);
const MergeOperator: z.ZodType<TableMergeOperator> = z.enum(TableMergeOperators);

/* Expressions */
const CompoundExpression: z.ZodType<TableCompoundExpression<TableSelector>> = z.object({
    type: z.literal(TableCompoundExpressionType),
    with: z.union([ComparisonOperator, MergeOperator]),
    items: z.array(z.lazy(() => Expression))
});

const NegatedExpression: z.ZodType<TableNegatedExpression<TableSelector>> = z.object({
    type: z.literal(TableNegatedExpressionType),
    on: z.lazy(() => Expression)
});

const FunctionExpression: z.ZodType<TableFunctionExpression<TableSelector>> = z.object({
    type: z.literal(TableFunctionExpressionType),
    name: z.string().transform(value => value.toUpperCase()),
    args: z.array(z.lazy(() => Expression))
});

const LiteralExpression: z.ZodType<TableLiteralExpression> = z.object({
    type: z.literal(TableLiteralExpressionType),
    of: z.union([z.string(), z.number(), z.boolean()])
});

const SelectorExpression: z.ZodType<TableSelectorExpression<TableSelector>> = z.object({
    type: z.literal(TableSelectorExpressionType),
    from: DataSelector
});

const RawExpression: z.ZodType<TableRawExpression<TableSelector>> = z.object({
    type: z.literal(TableRawExpressionType),
    text: z.string(),
    refs: z.record(z.string(), DataSelector)
});

const Expression: z.ZodType<TableExpression<TableSelector>> = z.union([
    CompoundExpression,
    NegatedExpression,
    FunctionExpression,
    LiteralExpression,
    SelectorExpression
]);

/* Data Rules */
const TemporalString: z.ZodType<TableTemporalString> = z.custom(value => TableTemporalStringRegex.test(value as string));

const makeValueRules = <T>(type: z.ZodType<T>) => {
    const comparison = z.object({
        type: ComparisonOperator,
        value: type
    });

    const between = z.object({
        type: z.enum(TableRangeOperators),
        low: type,
        high: type
    }) as z.ZodType<TableRangeRule<T>>;

    return z.union([comparison, between]);
};

const MatchRule: z.ZodType<TableMatchRule> = z.object({
    type: z.enum(TableMatchOperators),
    value: z.string()
});

const CustomRule: z.ZodType<TableCustomRule> = z.object({
    type: z.literal(TableCustomRuleType),
    expression: Expression
});

const NumericRule: z.ZodType<TableNumericRule> = z.union([makeValueRules(z.number()), CustomRule]);
const TemporalRule: z.ZodType<TableTemporalRule> = z.union([makeValueRules(TemporalString), CustomRule]);
const TextRule: z.ZodType<TableTextRule> = z.union([MatchRule, CustomRule]);

const makeConditionalStyle = <Rule extends z.ZodType<any>>(rule: Rule) => {
    return z.object({
        rule: rule,
        apply: StyleReference
    });
};

const TextConditionalStyle = makeConditionalStyle(TextRule);
const NumericConditionalStyle = makeConditionalStyle(NumericRule);
const TemporalConditionalStyle = makeConditionalStyle(TemporalRule);

/* Numeric Formats */
const DigitPlaceholder: z.ZodType<TableDigitPlaceholder> = z.object({
    fixed: z.number().int().min(0).optional(),
    flex: z.number().int().min(0).optional(),
    align: z.number().int().min(0).optional(),
});

const NumberOrDigitPlaceholder = z.union([z.number(), DigitPlaceholder]);

const makeNumberFormat = <Type extends string>(type: Type) => {
    return z.object({
        type: z.literal(type),
        integer: NumberOrDigitPlaceholder.optional(),
        decimal: NumberOrDigitPlaceholder.optional(),
        commas: z.boolean().optional(),
    });
};

const NumberFormat: z.ZodType<TableNumberFormat> = makeNumberFormat(TableNumberFormatType);
const PercentFormat: z.ZodType<TablePercentFormat> = makeNumberFormat(TablePercentFormatType);
const CurrencyFormat: z.ZodType<TableCurrencyFormat> = makeNumberFormat(TableCurrencyFormatType).and(z.object({
    symbol: z.string().optional(),
    position: z.enum(TableCurrencySymbolPositions).optional()
}));

const NumericFormat: z.ZodType<TableNumericFormat> = z.union([
    NumberFormat,
    PercentFormat,
    CurrencyFormat
]);

/* Temporal Format */
const TemporalUnitLength: z.ZodType<TableTemporalUnitLength> = z.enum(TableTemporalUnitLengths);
const TemporalUnitType: z.ZodType<TableTemporalUnitType> = z.enum(TableTemporalUnitTypes);
const TemporalUnit: z.ZodType<TableTemporalUnit> = z.object({
    type: TemporalUnitType,
    length: TemporalUnitLength
});

const TemporalItem: z.ZodType<TableTemporalItem> = z.union([TemporalUnit, z.string()]);
const TemporalFormat: z.ZodType<TableTemporalFormat> = z.array(TemporalItem);

/* Data Types */
const TextType: z.ZodType<TableTextType> = z.object({
    kind: z.literal(TableTextTypeKind),
    rule: TextRule.optional(),
    styles: z.array(TextConditionalStyle).optional()
});

const EnumItem: z.ZodType<TableEnumItem> = z.object({
    name: z.string(),
    description: z.string().optional(),
    style: StyleReference.optional()
});

const EnumType: z.ZodType<TableEnumType> = z.object({
    kind: z.literal(TableEnumTypeKind),
    items: z.array(EnumItem)
});

const LookupType: z.ZodType<TableLookupType> = z.object({
    kind: z.literal(TableLookupTypeKind),
    values: ColumnSelector
});

const NumericType: z.ZodType<TableNumericType> = z.object({
    kind: z.literal(TableNumericTypeKind),
    rule: NumericRule.optional(),
    styles: z.array(NumericConditionalStyle).optional(),
    format: z.union([NumericFormat, Reference]).optional()
});

const TemporalType: z.ZodType<TableTemporalType> = z.object({
    kind: z.literal(TableTemporalTypeKind),
    rule: TemporalRule.optional(),
    styles: z.array(TemporalConditionalStyle).optional(),
    format: z.union([TemporalFormat, Reference]).optional()
});



const ColumnType: z.ZodType<TableColumnType> = z.union([
    TextType,
    EnumType,
    LookupType,
    NumericType,
    TemporalType,
]);

/* Table Structures */
const TableUnit: z.ZodType<TableUnit> = z.object({
    name: z.string().regex(TableUnitNameRegex),
    theme: z.union([Theme, Reference]).optional(),
    description: z.string().optional()
});

const TableColumn: z.ZodType<TableColumn> = TableUnit.and(z.object({
    type: z.union([ColumnType, Reference]),
    source: z.string().optional(),
    expression: Expression.optional(),
}));

const TableGroup: z.ZodType<TableGroup> = TableUnit.and(z.object({
    columns: z.array(TableColumn).min(1)
}));

const TablePage: z.ZodType<TablePage> = TableUnit.and(z.object({
    groups: z.array(TableGroup).min(1),
    rows: z.number().int().positive()
}));

const TableDefinitions: z.ZodType<TableDefinitions> = z.object({
    colors: z.record(z.string(), z.union([Color, Reference])).optional(),
    styles: z.record(z.string(), z.union([HeaderStyle, Reference])).optional(),
    themes: z.record(z.string(), z.union([Theme, Reference])).optional(),
    numerics: z.record(z.string(), z.union([NumericFormat, Reference])).optional(),
    temporals: z.record(z.string(), z.union([TemporalFormat, Reference])).optional(),
    types: z.record(z.string(), z.union([ColumnType, Reference])).optional()
});

const TableBook: z.ZodType<TableBook> = TableUnit.and(z.object({
    pages: z.array(TablePage),
    definitions: TableDefinitions.optional()
}));

export { TableBook as TableBookValidator };
