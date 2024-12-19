import { BorderType, ColorObject } from "../tables/types";

export type SheetBorder = {
    type: BorderType;
    color: ColorObject;
};

export type SheetBorderSet = {
    top?: SheetBorder;
    bottom?: SheetBorder;
    left?: SheetBorder;
    right?: SheetBorder;
};

export type SheetStyle = {
    fore: ColorObject;
    back: ColorObject;
    bold: boolean;
    italic: boolean;
};

export type SheetPartitions = {
    beneath?: SheetBorder;
    between?: SheetBorder;
};

export type SheetHeaderStyle = {
    style: SheetStyle;
    borders?: SheetPartitions;
};
