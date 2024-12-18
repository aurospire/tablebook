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
