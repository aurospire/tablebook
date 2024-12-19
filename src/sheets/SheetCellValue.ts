export type SheetCellFormula = (column: number, row: number) => string;

export type SheetCellValue = string | number | boolean | SheetCellFormula;
