import { z } from 'zod';
import {
    FlatColumnReferences,
    FlatFormula,
    FlatNameRegex,
    FlatColorRegex,
    FlatEnum,
    FlatDecimals,
    FlatTypes,
    FlatNumericTypeRegex,
    FlatEnumTypeRegex,
    FlatManualSource,
    FlatFormulaSourceRegex,
    FlatExternalSourceRegex,
    FlatPalettes,
    FlatColumnType,
    FlatBook,
    FlatPage,
    FlatGroup,
    FlatColumn,
    FlatEnumType,
    FlatNumericType,
    FlatColor,
    FlatExternalSource,
    FlatFormulaSource,
    FlatColumnSource
} from './types';

const FlatColumnReferencesSchema: z.ZodType<FlatColumnReferences> = z.object({
    page: z.string(),
    group: z.string(),
    column: z.string()
});

const FlatFormulaSchema: z.ZodType<FlatFormula> = z.object({
    name: z.string(),
    description: z.string(),
    formula: z.string(),
    refs: z.record(FlatColumnReferencesSchema).optional()
});

const FlatNameSchema: z.ZodType<string> = z.custom<string>(value => FlatNameRegex.test(value as string));

const FlatColorSchema: z.ZodType<FlatColor> = z.custom<FlatColor>(value => FlatColorRegex.test(value as string));

const FlatEnumSchema: z.ZodType<FlatEnum> = z.object({
    name: FlatNameSchema,
    value: z.string(),
    description: z.string(),
    color: FlatColorSchema
});

const FlatDecimalsSchema: z.ZodType<FlatDecimals> = z.number();

const FlatTypesSchema: z.ZodType<typeof FlatTypes[number]> = z.enum(FlatTypes);

const FlatNumericTypeSchema: z.ZodType<FlatNumericType> = z.custom<FlatNumericType>(value => FlatNumericTypeRegex.test(value as string));

const FlatEnumTypeSchema: z.ZodType<FlatEnumType> = z.custom<FlatEnumType>(value => FlatEnumTypeRegex.test(value as string));

const FlatColumnTypeSchema: z.ZodType<FlatColumnType> = z.union([
    FlatTypesSchema,
    FlatNumericTypeSchema,
    FlatEnumTypeSchema
]);

const FlatFormulaSourceSchema: z.ZodType<FlatFormulaSource> = z.custom<FlatFormulaSource>(value => FlatFormulaSourceRegex.test(value as string));
const FlatExternalSourceSchema: z.ZodType<FlatExternalSource> = z.custom<FlatExternalSource>(value => FlatExternalSourceRegex.test(value as string));

const FlatColumnSourceSchema: z.ZodType<FlatColumnSource> = z.union([
    z.literal(FlatManualSource),
    FlatFormulaSourceSchema,
    FlatExternalSourceSchema
]);

const FlatColumnSchema: z.ZodType<FlatColumn> = z.object({
    page: FlatNameSchema,
    group: FlatNameSchema,
    name: FlatNameSchema,
    description: z.string(),
    source: FlatColumnSourceSchema,
    type: FlatColumnTypeSchema
});

const FlatGroupSchema: z.ZodType<FlatGroup> = z.object({
    page: FlatNameSchema,
    name: FlatNameSchema,
    description: z.string()
});

const FlatPaletteSchema: z.ZodType<typeof FlatPalettes[number]> = z.enum(FlatPalettes);

const FlatPageSchema: z.ZodType<FlatPage> = z.object({
    name: FlatNameSchema,
    description: z.string(),
    rows: z.number(),
    palette: FlatPaletteSchema
});

const FlatBookSchema: z.ZodType<FlatBook> = z.object({
    name: FlatNameSchema,
    description: z.string(),
    pages: z.array(FlatPageSchema),
    groups: z.array(FlatGroupSchema),
    columns: z.array(FlatColumnSchema),
    formulas: z.array(FlatFormulaSchema),
    enums: z.array(FlatEnumSchema)
});

export {
    FlatColumnReferencesSchema,
    FlatFormulaSchema,
    FlatNameSchema,
    FlatColorSchema,
    FlatEnumSchema,
    FlatDecimalsSchema,
    FlatTypesSchema,
    FlatNumericTypeSchema,
    FlatEnumTypeSchema,
    FlatColumnTypeSchema,
    FlatFormulaSourceSchema,
    FlatExternalSourceSchema,
    FlatColumnSourceSchema,
    FlatColumnSchema,
    FlatGroupSchema,
    FlatPaletteSchema,
    FlatPageSchema,
    FlatBookSchema
};
