import { z } from 'zod';
import { BetweenRule, BetweenRuleType, Border, BorderType, BorderTypes, Color, ColorRegex, ColumnReference, Comparable, ComparisonOperator, ComparisonOperators, ComparisonRule, CompoundExpression, CompoundExpressionType, ConditionalStyle, CurrencyFormat, CurrencyFormatType, CurrencySymbolPositions, CustomRule, CustomRuleType, CustomTheme, DataExpression, DataExpressionType, DataReference, DataType, DateFormats, DateFormatString, DateString, DateStringRegex, DateTimeString, DateTimeStringRegex, Definitions, DigitPlaceholder, EnumItem, EnumType, EnumTypeType, Expression, FunctionExpression, FunctionExpressionType, HeaderStyle, IntegrativeOperator, IntegrativeOperators, LiteralExpression, LiteralExpressionType, LookupType, LookupTypeType, MatchRule, MatchRuleTypes, NegatedExpression, NegatedExpressionType, NegativeFormats, NumberFormat, NumberFormatType, NumericFormat, NumericRule, NumericType, NumericTypeType, Operator, Partition, PercentFormat, PercentFormatType, PositionalRowReference, PositionalRowReferenceTypes, RangeRowReference, RangeRowReferenceType, Reference, ReferenceRegex, RowReference, Self, SelfExpression, SelfLiteral, StandardTheme, StandardThemes, Style, TableBook, TableColumn, TableGroup, TableSheet, TableUnit, TableUnitNameRegex, TemporalFormat, TemporalFormatType, TextForm, TextRule, TextType, TextTypeType, Theme, TimeFormats, TimeFormatString, TimeString, TimeStringRegex } from './types';

// Note: Manually doing validation instead of inferring types from these to keep types clean.
// I'm also ok with it using Object.value as any to extract const Object values
// as theres no way to extract values or keys from a const object here


/* Reference */
const Reference: z.ZodType<Reference> = z.custom<Reference>(value => ReferenceRegex.test(value as string));

/* Data Reference */
const Self: z.ZodType<Self> = z.literal(SelfLiteral);

const ColumnReference: z.ZodType<ColumnReference> = z.object({
    table: z.string().optional(),
    group: z.string().optional(),
    column: z.string()
});

const PositionalRowReference: z.ZodType<PositionalRowReference> = z.object({
    type: z.enum(PositionalRowReferenceTypes),
    value: z.number()
});

const RangeRowReference: z.ZodType<RangeRowReference> = z.object({
    type: z.literal(RangeRowReferenceType),
    start: PositionalRowReference,
    end: PositionalRowReference
});

const RowReference: z.ZodType<RowReference> = z.union([PositionalRowReference, RangeRowReference]);

const DataReference: z.ZodType<DataReference> = z.union([
    Self,
    z.object({
        column: z.union([ColumnReference, Self]),
        row: z.union([RowReference, Self]),
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
    color: ColorReference.optional(),
    width: z.number().int().optional(),
    type: BorderType.optional()
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

const CustomTheme: z.ZodType<CustomTheme> = z.object({
    inherits: Reference.optional(),
    group: HeaderStyleReference.optional(),
    header: HeaderStyleReference.optional(),
    data: StyleReference.optional(),
});

const StandardTheme: z.ZodType<StandardTheme> = z.enum(Object.keys(StandardThemes) as any);

const Theme: z.ZodType<Theme> = z.union([CustomTheme, StandardTheme]);


/* Operators */
const ComparisonOperator: z.ZodType<ComparisonOperator> = z.enum(ComparisonOperators);

const IntegrativeOperator: z.ZodType<IntegrativeOperator> = z.enum(IntegrativeOperators);

const Operator: z.ZodType<Operator> = z.union([
    ComparisonOperator,
    IntegrativeOperator
]);


/* Expressions */
const CompoundExpression: z.ZodType<CompoundExpression> = z.object({
    type: z.literal(CompoundExpressionType),
    with: Operator,
    left: z.lazy(() => Expression),
    right: z.lazy(() => Expression),
});

const NegatedExpression: z.ZodType<NegatedExpression> = z.object({
    type: z.literal(NegatedExpressionType),
    on: z.lazy(() => Expression)
});

const FunctionExpression: z.ZodType<FunctionExpression> = z.object({
    type: z.literal(FunctionExpressionType),
    name: z.string(),
    args: z.array(z.lazy(() => Expression))
});

const LiteralExpression: z.ZodType<LiteralExpression> = z.object({
    type: z.literal(LiteralExpressionType),
    value: z.union([z.string(), z.number(), z.boolean()])
});

const DataExpression: z.ZodType<DataExpression> = z.object({
    type: z.literal(DataExpressionType),
    from: DataReference
});

const SelfExpression: z.ZodType<SelfExpression> = z.object({
    type: Self
});

const Expression: z.ZodType<Expression> = z.union([
    CompoundExpression,
    NegatedExpression,
    FunctionExpression,
    LiteralExpression,
    DataExpression,
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
        type: z.literal(BetweenRuleType),
        low: c,
        high: c
    }) as z.ZodType<BetweenRule<C>>;

    return z.union([comparison, between]);
};

const MatchRule: z.ZodType<MatchRule> = z.object({
    type: z.enum(MatchRuleTypes),
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
    fixed: z.number().int().optional(),
    flex: z.number().int().optional(),
    align: z.number().int().optional(),
});

const NumberOrDigitPlaceholder = z.union([z.number(), DigitPlaceholder]);

const makeNumberFormat = <Type extends string>(type: Type) => {
    return z.object({
        type: z.literal(type),
        integer: NumberOrDigitPlaceholder.optional(),
        decimal: NumberOrDigitPlaceholder.optional(),
        commas: z.boolean().optional(),
        negatives: z.enum(NegativeFormats).optional()
    });
};

const NumberFormat: z.ZodType<NumberFormat> = makeNumberFormat(NumberFormatType);

const PercentFormat: z.ZodType<PercentFormat> = makeNumberFormat(PercentFormatType);

const CurrencyFormat: z.ZodType<CurrencyFormat> = makeNumberFormat(CurrencyFormatType).and(z.object({
    symbol: z.string().optional(),
    position: z.enum(CurrencySymbolPositions).optional()
}));


const DateFormatString: z.ZodType<DateFormatString> = z.enum(Object.values(DateFormats) as any);

const TimeFormatString: z.ZodType<TimeFormatString> = z.enum(Object.values(TimeFormats) as any);

// Empty Temporal is simply an ISODate
const TemporalFormat: z.ZodType<TemporalFormat> = z.object({
    type: z.literal(TemporalFormatType),
    date: DateFormatString.optional(),
    time: TimeFormatString.optional(),
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
    values: ColumnReference
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
