import { z } from 'zod';
import {
    Border, BorderType, BorderTypes,
    Color,
    ColorRegex,
    ColumnSelector,
    ComparisonOperator,
    ComparisonOperators,
    ComparisonRule,
    CompoundExpression, CompoundExpressionType,
    CurrencyFormat, CurrencyFormatType, CurrencySymbolPositions,
    CustomRule, CustomRuleType,
    DataSelector,
    DataType,
    Definitions,
    DigitPlaceholder,
    EnumItem, EnumType, EnumTypeName,
    Expression,
    FunctionExpression, FunctionExpressionType,
    HeaderStyle,
    LiteralExpression,
    LiteralExpressionType,
    LookupType, LookupTypeType,
    MatchOperators,
    MatchRule,
    MergeOperator, MergeOperators,
    NegatedExpression, NegatedExpressionType,
    NumberFormat, NumberFormatType,
    NumericFormat,
    NumericRule,
    NumericType, NumericTypeName,
    Partition,
    PercentFormat, PercentFormatType,
    RangeOperators,
    RangeRowSelector,
    RangeRule,
    Reference, ReferenceRegex,
    RowSelector,
    SelectorExpression, SelectorExpressionType,
    SelfExpression, SelfLiteral, SelfSelector,
    Style,
    TableBook, TableColumn,
    TableGroup, TableSheet,
    TableUnit, TableUnitNameRegex,
    TemporalFormat,
    TemporalItem,
    TemporalRule,
    TemporalString,
    TemporalStringRegex,
    TemporalType, TemporalTypeName,
    TemporalUnit,
    TemporalUnitLength, TemporalUnitLengths,
    TemporalUnitType, TemporalUnitTypes,
    TextForm,
    TextRule,
    TextType, TextTypeName,
    Theme,
    UnitSelector, UnitSelectorRegex
} from './types';

/* Reference */
const Reference: z.ZodType<Reference> = z.custom<Reference>(value => ReferenceRegex.test(value as string));

/* Data Reference */
const SelfSelector: z.ZodType<SelfSelector> = z.literal(SelfLiteral);

const ColumnSelector: z.ZodType<ColumnSelector> = z.object({
    table: z.string().optional(),
    group: z.string().optional(),
    name: z.string()
});

const UnitSelector: z.ZodType<UnitSelector> = z.custom<UnitSelector>(value => UnitSelectorRegex.test(value as string));

const RangeRowSelector: z.ZodType<RangeRowSelector> = z.object({
    from: UnitSelector,
    to: UnitSelector
});

const RowSelector: z.ZodType<RowSelector> = z.union([UnitSelector, RangeRowSelector]);

const DataSelector: z.ZodType<DataSelector> = z.union([
    SelfSelector,
    z.object({
        column: z.union([ColumnSelector, SelfSelector]),
        row: z.union([RowSelector, SelfSelector]).optional(),
    })
]);

/* Styling */
const Color: z.ZodType<Color> = z.custom(value => ColorRegex.test(value as string));

const TextForm: z.ZodType<TextForm> = z.union([
    z.boolean(),
    z.object({
        bold: z.boolean().optional(),
        italic: z.boolean().optional()
    })
]);

const ColorReference = z.union([Color, Reference]);

const Style: z.ZodType<Style> = z.object({
    fore: ColorReference.optional(),
    back: ColorReference.optional(),
    form: TextForm.optional()
});

const BorderType: z.ZodType<BorderType> = z.enum(BorderTypes);

const Border: z.ZodType<Border> = z.object({
    type: BorderType,
    color: ColorReference.optional(),
});

const Partition: z.ZodType<Partition> = z.object({
    below: Border.optional(),
    between: Border.optional()
});

const HeaderStyle: z.ZodType<HeaderStyle> = Style.and(Partition);

const HeaderStyleReference = z.union([HeaderStyle, Reference]);
const StyleReference = z.union([Style, Reference]);

const Theme: z.ZodType<Theme> = z.object({
    inherits: z.array(Reference).optional(),
    tab: ColorReference.optional(),
    group: HeaderStyleReference.optional(),
    header: HeaderStyleReference.optional(),
    data: StyleReference.optional(),
});

/* Operators */
const ComparisonOperator: z.ZodType<ComparisonOperator> = z.enum(ComparisonOperators);
const MergeOperator: z.ZodType<MergeOperator> = z.enum(MergeOperators);

/* Expressions */
const CompoundExpression: z.ZodType<CompoundExpression<DataSelector>> = z.object({
    type: z.literal(CompoundExpressionType),
    with: z.union([ComparisonOperator, MergeOperator]),
    items: z.array(z.lazy(() => Expression))
});

const NegatedExpression: z.ZodType<NegatedExpression<DataSelector>> = z.object({
    type: z.literal(NegatedExpressionType),
    on: z.lazy(() => Expression)
});

const FunctionExpression: z.ZodType<FunctionExpression<DataSelector>> = z.object({
    type: z.literal(FunctionExpressionType),
    name: z.string(),
    args: z.array(z.lazy(() => Expression))
});

const LiteralExpression: z.ZodType<LiteralExpression> = z.object({
    type: z.literal(LiteralExpressionType),
    value: z.union([z.string(), z.number(), z.boolean()])
});

const SelectorExpression: z.ZodType<SelectorExpression<DataSelector>> = z.object({
    type: z.literal(SelectorExpressionType),
    from: DataSelector
});

const SelfExpression: z.ZodType<SelfExpression> = z.object({
    type: SelfSelector
});

const Expression: z.ZodType<Expression<DataSelector>> = z.union([
    CompoundExpression,
    NegatedExpression,
    FunctionExpression,
    LiteralExpression,
    SelectorExpression,
    SelfExpression
]);

/* Data Rules */
const TemporalString: z.ZodType<TemporalString> = z.custom(value => TemporalStringRegex.test(value as string));

const makeValueRules = <T>(type: z.ZodType<T>) => {
    const comparison = z.object({
        type: ComparisonOperator,
        to: type
    }) as z.ZodType<ComparisonRule<T>>;

    const between = z.object({
        type: z.enum(RangeOperators),
        low: type,
        high: type
    }) as z.ZodType<RangeRule<T>>;

    return z.union([comparison, between]);
};

const MatchRule: z.ZodType<MatchRule> = z.object({
    type: z.enum(MatchOperators),
    value: z.string()
});

const CustomRule: z.ZodType<CustomRule> = z.object({
    type: z.literal(CustomRuleType),
    expression: Expression
});

const NumericRule: z.ZodType<NumericRule> = z.union([makeValueRules(z.number()), CustomRule]);
const TemporalRule: z.ZodType<TemporalRule> = z.union([makeValueRules(TemporalString), CustomRule]);
const TextRule: z.ZodType<TextRule> = z.union([MatchRule, CustomRule]);

const makeConditionalStyle = <Rule extends z.ZodType<any>>(rule: Rule) => {
    return z.object({
        on: rule,
        style: StyleReference
    });
};

const TextConditionalStyle = makeConditionalStyle(TextRule);
const NumericConditionalStyle = makeConditionalStyle(NumericRule);
const TemporalConditionalStyle = makeConditionalStyle(TemporalRule);

/* Numeric Formats */
const DigitPlaceholder: z.ZodType<DigitPlaceholder> = z.object({
    fixed: z.number().int().positive().optional(),
    flex: z.number().int().positive().optional(),
    align: z.number().int().positive().optional(),
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

const NumberFormat: z.ZodType<NumberFormat> = makeNumberFormat(NumberFormatType);
const PercentFormat: z.ZodType<PercentFormat> = makeNumberFormat(PercentFormatType);
const CurrencyFormat: z.ZodType<CurrencyFormat> = makeNumberFormat(CurrencyFormatType).and(z.object({
    symbol: z.string().optional(),
    position: z.enum(CurrencySymbolPositions).optional()
}));

const NumericFormat: z.ZodType<NumericFormat> = z.union([
    NumberFormat,
    PercentFormat,
    CurrencyFormat
]);

/* Temporal Format */
const TemporalUnitLength: z.ZodType<TemporalUnitLength> = z.enum(TemporalUnitLengths);
const TemporalUnitType: z.ZodType<TemporalUnitType> = z.enum(TemporalUnitTypes);
const TemporalUnit: z.ZodType<TemporalUnit> = z.object({
    type: TemporalUnitType,
    length: TemporalUnitLength
});

const TemporalItem: z.ZodType<TemporalItem> = z.union([TemporalUnit, z.string()]);
const TemporalFormat: z.ZodType<TemporalFormat> = z.array(TemporalItem);

/* Data Types */
const TextType: z.ZodType<TextType> = z.object({
    name: z.literal(TextTypeName),
    rule: TextRule.optional(),
    styles: z.array(TextConditionalStyle).optional()
});

const NumericType: z.ZodType<NumericType> = z.object({
    name: z.literal(NumericTypeName),
    rule: NumericRule.optional(),
    styles: z.array(NumericConditionalStyle).optional(),
    format: z.union([NumericFormat, Reference]).optional()
});

const TemporalType: z.ZodType<TemporalType> = z.object({
    name: z.literal(TemporalTypeName),
    rule: TemporalRule.optional(),
    styles: z.array(TemporalConditionalStyle).optional(),
    format: z.union([TemporalFormat, Reference]).optional()
});

const EnumItem: z.ZodType<EnumItem> = z.union([
    z.string(),
    z.object({
        value: z.string(),
        style: StyleReference.optional()
    })
]);

const EnumType: z.ZodType<EnumType> = z.object({
    name: z.literal(EnumTypeName),
    values: z.array(EnumItem)
});

const LookupType: z.ZodType<LookupType> = z.object({
    name: z.literal(LookupTypeType),
    values: ColumnSelector
});

const DataType: z.ZodType<DataType> = z.union([
    TextType,
    NumericType,
    TemporalType,
    EnumType,
    LookupType,
    Reference
]);

/* Table Structures */
const TableUnit: z.ZodType<TableUnit> = z.object({
    name: z.string().regex(TableUnitNameRegex),
    theme: z.union([Theme, Reference]).optional(),
    description: z.string().optional()
});

const TableColumn: z.ZodType<TableColumn> = TableUnit.and(z.object({
    type: DataType,
    source: z.string().optional(),
    expression: Expression.optional(),
}));

const TableGroup: z.ZodType<TableGroup> = TableUnit.and(z.object({
    columns: z.array(TableColumn).min(1)
}));

const TableSheet: z.ZodType<TableSheet> = TableUnit.and(z.object({
    groups: z.array(TableGroup).min(1),
    rows: z.number().int().positive()
}));

const Definitions: z.ZodType<Definitions> = z.object({
    colors: z.record(z.string(), Color).optional(),
    styles: z.record(z.string(), z.union([Style, HeaderStyle])).optional(),
    themes: z.record(z.string(), Theme).optional(),
    numerics: z.record(z.string(), NumericFormat).optional(),
    temporals: z.record(z.string(), TemporalFormat).optional(),
    types: z.record(z.string(), DataType).optional()
});

const TableBook: z.ZodType<TableBook> = TableUnit.and(z.object({
    sheets: z.array(TableSheet),
    definitions: Definitions.optional()
}));

export { TableBook as TableBookValidator };
