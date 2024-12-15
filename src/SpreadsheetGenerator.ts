// export interface SpreadsheetGenerator {
//     setTitle(name: string): Promise<void>;

//     addSheet(name: string, rows: string /* (group ? 1: 0) + 1 (for header) + rows */): Promise<number>; // index of new Sheet

//     addGroup(sheet: number, name: string, index: number, columns: number, style: SheetStyle): Promise<void>;

//     addColumn(sheet: number, name: string, offset: number, headerStyle: SheetStyle,dataStyle: SheetStyle expression?: SheetExpressionGenerator, validation?: SheetValidator, conditionalStyles?: SheetConditionalStyles[] ): Promise<void>;
// }