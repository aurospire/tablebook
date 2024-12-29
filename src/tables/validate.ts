import { z } from 'zod';
import {
    RangeOperators,
    RangeRule,
    Border, BorderType, BorderTypes,
    Color,
    ColorRegex,
    ColumnSelector, Comparable, ComparisonOperator,
    ComparisonOperators, ComparisonRule, CompoundExpression, CompoundExpressionType,
    ConditionalStyle, CurrencyFormat, CurrencyFormatType, CurrencySymbolPositions,
    CustomRule, CustomRuleType,
    DataSelector, DataType, DateString, DateStringRegex,
    DateTimeString, DateTimeStringRegex, Definitions,
    DigitPlaceholder, EnumItem, EnumType, EnumTypeType, Expression,
    FunctionExpression, FunctionExpressionType, HeaderStyle,
    IntegrativeOperator, IntegrativeOperators, LiteralExpression,
    LookupType, LookupTypeType,
    MatchOperators,
    MatchRule,
    NegatedExpression, NegatedExpressionType,

    NumberFormat, NumberFormatType,
    NumericFormat,
    NumericRule, NumericType, NumericTypeType,
    Partition, PercentFormat, PercentFormatType,
    RangeRowSelector, RangeRowSelectorType,
    Reference, ReferenceRegex, RowSelector,
    SelectorExpression, SelectorExpressionType,
    SelfExpression, SelfLiteral, SelfSelector,

    Style, TableBook, TableColumn,
    TableGroup, TableSheet, TableUnit, TableUnitNameRegex, TemporalFormat,
    TemporalFormatType,
    TemporalItem,
    TemporalUnit,
    TemporalUnitLength, TemporalUnitLengths,
    TemporalUnitType,
    TemporalUnitTypes,
    TextForm, TextRule, TextType,
    TextTypeType, Theme,
    TimeString, TimeStringRegex,
    UnitSelector,
    UnitSelectorRegex
} from './types';

// Note: Manually doing validation instead of inferring types from these to keep types clean.
// I'm also ok with it using Object.value as any to extract const Object values
// as theres no way to extract values or keys from a const object here


/* Reference */
const Reference: z.ZodType<Reference> = z.custom<Reference>(value => ReferenceRegex.test(value as string));

/* Data Reference */
const SelfSelector: z.ZodType<SelfSelector> = z.literal(SelfLiteral);

const ColumnSelector: z.ZodType<ColumnSelector> = z.object({
    table: z.string().optional(),
    group: z.string().optional(),
    column: z.string()
});

const UnitSelector: z.ZodType<UnitSelector> = z.custom<UnitSelector>(value => UnitSelectorRegex.test(value as string));

const RangeRowSelector: z.ZodType<RangeRowSelector> = z.object({
    type: z.literal(RangeRowSelectorType),
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

const HeaderStyle: z.ZodType<HeaderStyle> = Style.and(z.object({
    partition: Partition.optional()
}));


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

const IntegrativeOperator: z.ZodType<IntegrativeOperator> = z.enum(IntegrativeOperators);

/* Expressions */
const CompoundExpression: z.ZodType<CompoundExpression<DataSelector>> = z.object({
    type: z.literal(CompoundExpressionType),
    with: z.union([ComparisonOperator, IntegrativeOperator]),
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

const LiteralExpression: z.ZodType<LiteralExpression> = z.union([z.string(), z.number(), z.boolean()]);

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
const DateString: z.ZodType<DateString> = z.custom(value => DateStringRegex.test(value as string));

const TimeString: z.ZodType<TimeString> = z.custom(value => TimeStringRegex.test(value as string));

const DateTimeString: z.ZodType<DateTimeString> = z.custom(value => DateTimeStringRegex.test(value as string));


const Comparable: z.ZodType<Comparable> = z.union([
    z.number(),
    DateString,
    TimeString,
    DateTimeString
]);

const makeValueRules = <C extends Comparable>(c: z.ZodType<C>) => {
    const comparison = z.object({
        type: ComparisonOperator,
        to: c
    }) as z.ZodType<ComparisonRule<C>>;

    const between = z.object({
        type: z.enum(RangeOperators),
        low: c,
        high: c
    }) as z.ZodType<RangeRule<C>>;

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


const NumericRule: z.ZodType<NumericRule> = z.union([
    makeValueRules(Comparable),
    CustomRule
]);

const TextRule: z.ZodType<TextRule> = z.union([
    MatchRule,
    makeValueRules(z.number()),
    CustomRule
]);

const TextConditionalStyle: z.ZodType<ConditionalStyle<TextRule>> = z.object({
    on: z.array(TextRule),
    style: StyleReference
});

const NumericConditionalStyle: z.ZodType<ConditionalStyle<NumericRule>> = z.object({
    on: z.array(NumericRule),
    style: StyleReference
});


/* Numeric Format */
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


const TemporalUnitLength: z.ZodType<TemporalUnitLength> = z.enum(TemporalUnitLengths);
const TemporalUnitType: z.ZodType<TemporalUnitType> = z.enum(TemporalUnitTypes);
const TemporalUnit: z.ZodType<TemporalUnit> = z.object({
    type: TemporalUnitType,
    length: TemporalUnitLength
});

const TemporaItem: z.ZodType<TemporalItem> = z.union([TemporalUnit, z.string()]);

const TemporalFormat: z.ZodType<TemporalFormat> = z.object({
    type: z.literal(TemporalFormatType),
    items: z.array(TemporaItem)
});

const NumericFormat: z.ZodType<NumericFormat> = z.union([
    NumberFormat,
    PercentFormat,
    CurrencyFormat,
    TemporalFormat
]);


/* Data Types */
const TextType: z.ZodType<TextType> = z.object({
    type: z.literal(TextTypeType),
    expression: Expression.optional(),
    rules: z.array(TextRule).optional(),
    styles: z.array(TextConditionalStyle).optional()
});

const NumericType: z.ZodType<NumericType> = z.object({
    type: z.literal(NumericTypeType),
    expression: Expression.optional(),
    rules: z.array(NumericRule).optional(),
    styles: z.array(NumericConditionalStyle).optional(),
    format: NumericFormat.optional(),
});

const EnumItem: z.ZodType<EnumItem> = z.union([
    z.string(),
    z.object({
        value: z.string(),
        style: StyleReference.optional()
    })
]);

const EnumType: z.ZodType<EnumType> = z.object({
    type: z.literal(EnumTypeType),
    values: z.array(EnumItem)
});

const LookupType: z.ZodType<LookupType> = z.object({
    type: z.literal(LookupTypeType),
    values: ColumnSelector
});

const DataType: z.ZodType<DataType> = z.union([
    TextType,
    NumericType,
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
    source: z.string().optional()
}));

const TableGroup: z.ZodType<TableGroup> = TableUnit.and(z.object({
    columns: z.array(TableColumn).min(1)
}));

const TableSheet: z.ZodType<TableSheet> = TableUnit.and(z.object({
    groups: z.array(TableGroup).min(1),
    rows: z.number().int().positive()
}));

const Definitions: z.ZodType<Definitions> = z.object({
    colors: z.record(z.string(), Color).default({}),
    styles: z.record(z.string(), z.union([Style, HeaderStyle])).default({}),
    themes: z.record(z.string(), Theme).default({}),
    types: z.record(z.string(), DataType).default({}),
});

const TableBook: z.ZodType<TableBook> = TableUnit.and(z.object({
    sheets: z.array(TableSheet),
    definitions: Definitions.optional()
}));


export { TableBook as TableBookValidator };
