import { z } from 'zod';
import { ColumnReference, DataReference, Inheritor, PositionRowReference, RangeRowReference, Reference, RowReference, Self } from './types';

// Simpler to manually do these

/* Reference */
const Reference: z.ZodType<Reference> = z.custom<Reference>(val => {
    /@.+/.test(val as string);
});

const Inheritor: z.ZodType<Inheritor> = z.object({
    inherit: Reference.optional()
});

/* Data Reference */
const Self: z.ZodType<Self> = z.literal('self');

const ColumnReference: z.ZodType<ColumnReference> = z.object({
    table: z.string().optional(),
    group: z.string().optional(),
    column: z.string()
});

const PositionRowReference: z.ZodType<PositionRowReference> = z.object({
    type: z.enum(['index', 'offset']),
    value: z.number()
});

const RangeRowReference: z.ZodType<RangeRowReference> = z.object({
    type: z.literal('range'),
    start: z.lazy(() => RowReference),
    end: z.lazy(() => RowReference),
});

const RowReference: z.ZodType<RowReference> = z.union([PositionRowReference, RangeRowReference]);

const DataReference: z.ZodType<DataReference> = z.object({
    column: z.union([ColumnReference, Self]),
    row: z.union([RowReference, Self]),
});

/* Styling */