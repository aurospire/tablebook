import { BorderType, HexColor, ComparisonOperator, NumericFormat, BetweenOperator, MatchOperators, ComparisonOperators } from "../types/types";
import { Color } from "../util/Color";

// Basic style configuration for a cell or range
export type SheetStyle = {
    fore: Color;
    back: Color;
    bold: boolean;
    italic: boolean;
};

// Border configuration for a cell or range
export type SheetBorder = {
    type: BorderType;
    color: Color;
};

// Border configuration for groups and headers
export type SheetBorderConfig = {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

// Style and border configuration for headers
export type SheetHeaderConfig = {
    style: SheetStyle;
    borders?: SheetBorderConfig;
};


const aCode = 'A'.charCodeAt(0);

export const columnToLetter = (column: number): string => {
    let result = '';
    do {
        const digit = column % 26;
        column = (column / 26) | 0;
        result = String.fromCharCode(aCode + digit) + result;
    } while (column > 0);

    return result;
};

// Formula chunks are just literal pieces that can be concatenated
export type SheetFormulaChunk = string | number;

// Creates a formula generator function that takes a row and returns the complete formula
export type SheetFormulaGenerator = (row: number) => string;



// Combined configuration for a column
export type SheetColumnConfig = {
    header: SheetHeaderConfig;
    data: SheetDataConfig;
};

// Comprehensive configuration for data cells
export type SheetDataConfig = {
    style: SheetStyle;
    format?: NumericFormat;
    validation?: SheetCondition;
    formula?: SheetFormulaGenerator;
    conditionalFormats?: SheetConditionalFormat[];
};


// Types of values that can be compared
export type ComparisonValue = number | string;

// Target types for comparison operations
export type ComparisonTarget = 'numeric' | 'length';

// Condition for comparing values
export type SheetComparisonCondition = {
    type: typeof ComparisonOperators[number];
    target: ComparisonTarget;
    value: ComparisonValue;
};

// Condition for checking if value is within a range
export type SheetBetweenCondition = {
    type: typeof BetweenOperator;
    target: ComparisonTarget;
    low: ComparisonValue;
    high: ComparisonValue;
};

// Condition for text pattern matching
export type SheetMatchCondition = {
    typeof: typeof MatchOperators[number];
    value: string;
};

// Conditions for validating against lists
export type SheetEnumCondition = {
    type: 'enum';
    values: string[];
};

export type SheetLookupCondition = {
    type: 'lookup';
    from: string; // formula is [Sheet!]$Column(Groups?2:1):$Column(Rows+Groups?2:1)
};

// Condition using custom formula
export type SheetFormulaCondition = {
    type: 'formula';
    from: SheetFormulaGenerator;
};

// Union of all possible conditions
export type SheetCondition =
    | SheetComparisonCondition
    | SheetBetweenCondition
    | SheetMatchCondition
    | SheetEnumCondition
    | SheetLookupCondition
    | SheetFormulaCondition;

// Factory function to create formula generators
export const createFormulaGenerator = (chunks: SheetFormulaChunk[]): SheetFormulaGenerator =>
    row => chunks.map(chunk => typeof chunk === 'number' ? (chunk + row).toString() : chunk).join('');


// Conditional formatting rules
export type SheetConditionalFormat = { condition: SheetCondition; style: SheetStyle; };

// Core generator interface for platform implementations
export interface SpreadsheetGenerator {
    setTitle(name: string): Promise<void>;

    addSheet(name: string, rows: number, columns: number): Promise<number>;

    addGroup(
        sheet: number,
        name: string,
        columnStart: number,
        columnCount: number,
        style?: SheetStyle,
        borders?: SheetBorderConfig
    ): Promise<void>;

    addColumn(
        sheet: number,
        name: string,
        columnIndex: number,
        config: SheetColumnConfig
    ): Promise<void>;
}