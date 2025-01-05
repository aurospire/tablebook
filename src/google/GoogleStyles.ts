import { SheetBorder } from "../sheets/SheetStyle";
import { BorderType } from "../tables/types";
import { ColorObject, Colors } from "../util/Color";
import { GoogleBorder, GoogleColorStyle } from "./GoogleTypes";


export const GoogleBorderMap = {
    none: 'NONE',
    thin: 'SOLID',
    medium: 'SOLID_MEDIUM',
    thick: 'SOLID_THICK',
    dotted: 'DOTTED',
    dashed: 'DASHED',
    double: 'DOUBLE',
} as const satisfies Record<BorderType, string>;


export const toSheetsBorder = (border: SheetBorder | undefined): GoogleBorder | undefined => {
    return border ? {
        style: GoogleBorderMap[border.type],
        colorStyle: toWeightedColorStyle(border.color),
    } : undefined;
};

export const toWeightedColorStyle = (color: ColorObject | undefined): GoogleColorStyle | undefined => {
    return color ? { rgbColor: Colors.toWeighted(color) } : undefined;
};