import { SheetCellProperties } from './SheetCellProperties';
import { SheetCellValue } from './SheetCellValue';

export type SheetCell = {
    value?: SheetCellValue | null;
    props?: SheetCellProperties | null;
};