import { SheetCellProperties } from './SheetCellProperties';
import { SheetCellValue } from './SheetCellValue';

export type SheetCellData = {
    value?: SheetCellValue | null;
    props?: SheetCellProperties | null;
};

export type SheetRangeData = {
    values?: (SheetCellValue | null)[][];
    props?: SheetCellProperties | null;
};