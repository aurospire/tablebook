import { SheetCellProperties } from './SheetCellFormat';
import { SheetCellValue } from './SheetCellValue';

export type SheetCell = {
    value?: SheetCellValue | null;
    props?: SheetCellProperties | null;
};