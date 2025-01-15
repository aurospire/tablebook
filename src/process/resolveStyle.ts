import { SheetTitleStyle, SheetBorder } from "../sheets";
import { HeaderStyle, Reference, Color, Style } from "../tables/types";
import { ColorObject } from "../util";
import { resolveColor } from "./resolveColor";
import { isReference, resolveReference } from "./resolveReference";

export const resolveStyle = (style: HeaderStyle | Reference, colors: Record<string, Color | Reference>, styles: Record<string, Style | Reference>): SheetTitleStyle => {
    if (isReference(style))
        return resolveStyle(resolveReference(style, styles, v => typeof v === 'object'), colors, styles);

    const fore: ColorObject | undefined = style.fore ? resolveColor(style.fore, colors) : undefined;
    const back: ColorObject | undefined = style.back ? resolveColor(style.back, colors) : undefined;
    const bold: boolean | undefined = style.bold;
    const italic: boolean | undefined = style.italic;

    let beneath: SheetBorder | undefined;
    if (style.beneath)
        beneath = {
            type: style.beneath.type,
            color: style.beneath.color ? resolveColor(style.beneath.color, colors) : undefined
        };

    let between: SheetBorder | undefined;
    if (style.between)
        between = {
            type: style.between.type,
            color: style.between.color ? resolveColor(style.between.color, colors) : undefined
        };


    return { fore, back, bold, italic, beneath, between };
};
