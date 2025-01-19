import { z, ZodType } from 'zod';
import {
    FlatBook,
    FlatColor,
    FlatColorRegex,
    FlatColumn,
    FlatColumnSource,
    FlatColumnType,
    FlatDecimals,
    FlatEnumItem,
    FlatEnumType,
    FlatEnumTypeRegex,
    FlatExternalSource,
    FlatExternalSourceRegex,
    FlatFormula,
    FlatFormulaSource,
    FlatFormulaSourceRegex,
    FlatGroup,
    FlatLookupType,
    FlatLookupTypeRegex,
    FlatManualSource,
    FlatNameRegex,
    FlatNumericType,
    FlatNumericTypeRegex,
    FlatPalette,
    FlatPalettes,
    FlatPlaceholder,
    FlatRowSelection,
    FlatRowSelectionRegex,
    FlatSelection,
    FlatTable,
    FlatTypes
} from './types';

/** Helper for normalizing template strings */
const TemplateSchema = <T>(name: string, regex: RegExp): ZodType<T> =>
    z.custom<T>(
        value => regex.test(value as string),
        { message: `Invalid ${name} format` }
    );

/** Schema for FlatName values. */
const FlatNameSchema: ZodType<string> = TemplateSchema<string>('FlatName', FlatNameRegex);

/** Schema for FlatColor values. */
const FlatColorSchema: ZodType<FlatColor> = TemplateSchema<FlatColor>('FlatColor', FlatColorRegex);

/** Schema for FlatEnum values. */
const FlatEnumItemSchema: ZodType<FlatEnumItem> = z.object({
    name: FlatNameSchema,
    value: z.string(),
    description: z.string(),
    color: FlatColorSchema,
});

/** Schema for numeric precision values (FlatDecimals). */
const FlatDecimalsSchema: ZodType<FlatDecimals> = z.number();

/** Schema for FlatTypes values. */
const FlatTypesSchema: ZodType<typeof FlatTypes[number]> = z.enum(FlatTypes);

/** Schema for FlatNumericType values. */
const FlatNumericTypeSchema: ZodType<FlatNumericType> = TemplateSchema<FlatNumericType>('FlatNumericType', FlatNumericTypeRegex);

/** Schema for FlatEnumType values. */
const FlatEnumTypeSchema: ZodType<FlatEnumType> = TemplateSchema<FlatEnumType>('FlatEnumType', FlatEnumTypeRegex);

/** Schema for FlatLookupType values. */
const FlatLookupTypeSchema: ZodType<FlatLookupType> =  TemplateSchema<FlatLookupType>('FlatLookupType', FlatLookupTypeRegex)

/** Schema for FlatColumnType values. */
const FlatColumnTypeSchema: ZodType<FlatColumnType> = z.union([
    FlatTypesSchema,
    FlatNumericTypeSchema,
    FlatEnumTypeSchema,
    FlatLookupTypeSchema    
]);

/** Schema for FlatFormulaSource values. */
const FlatFormulaSourceSchema: ZodType<FlatFormulaSource> = TemplateSchema<FlatFormulaSource>('FlatFormulaSource', FlatFormulaSourceRegex);

/** Schema for FlatExternalSource values. */
const FlatExternalSourceSchema: ZodType<FlatExternalSource> = TemplateSchema<FlatExternalSource>('FlatExternalSource', FlatExternalSourceRegex);

/** Schema for FlatColumnSource values. */
const FlatColumnSourceSchema: ZodType<FlatColumnSource> = z.union([
    z.literal(FlatManualSource),
    FlatFormulaSourceSchema,
    FlatExternalSourceSchema,
]);

/** Schema for FlatRowSelection values. */
const FlatRowSelectionSchema: ZodType<FlatRowSelection> = TemplateSchema<FlatRowSelection>('FlatRowSelection', FlatRowSelectionRegex);

/** Schema for FlatSelection values. */
const FlatSelectionSchema: ZodType<FlatSelection> = z.object({
    table: FlatNameSchema,
    group: FlatNameSchema,
    column: FlatNameSchema,
    rows: FlatRowSelectionSchema,
});

/** Schema for FlatPlaceholder values. */
const FlatPlaceholderSchema: ZodType<FlatPlaceholder> = z.object({
    tag: z.string(),
    selection: FlatSelectionSchema,
});

/** Schema for FlatFormula values. */
const FlatFormulaSchema: ZodType<FlatFormula> = z.object({
    name: z.string(),
    description: z.string(),
    formula: z.string(),
    refs: z.array(FlatPlaceholderSchema),
});

/** Schema for FlatColumn values. */
const FlatColumnSchema: ZodType<FlatColumn> = z.object({
    table: FlatNameSchema,
    group: FlatNameSchema,
    name: FlatNameSchema,
    description: z.string(),
    source: FlatColumnSourceSchema,
    type: FlatColumnTypeSchema,
});

/** Schema for FlatGroup values. */
const FlatGroupSchema: ZodType<FlatGroup> = z.object({
    table: FlatNameSchema,
    name: FlatNameSchema,
    description: z.string(),
});

/** Schema for FlatPalette values. */
const FlatPaletteSchema: ZodType<FlatPalette> = z.enum(FlatPalettes);

/** Schema for FlatTable values. */
const FlatTableSchema: ZodType<FlatTable> = z.object({
    name: FlatNameSchema,
    description: z.string(),
    rows: z.number(),
    palette: FlatPaletteSchema,
});

/** Schema for FlatBook values. */
const FlatBookSchema: ZodType<FlatBook> = z.object({
    name: FlatNameSchema,
    description: z.string(),
    tables: z.array(FlatTableSchema),
    groups: z.array(FlatGroupSchema),
    formulas: z.array(FlatFormulaSchema),
    enums: z.array(FlatEnumItemSchema),
    columns: z.array(FlatColumnSchema),
});

export { FlatBookSchema };
