import { SheetBorder, SheetStyle } from "./SheetStyle";

export type SheetHeaderPartitions = {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

export type SheetHeaderStyle = {
    style: SheetStyle;
    borders?: SheetHeaderPartitions;
};
