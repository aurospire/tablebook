import { Color, Reference } from "../tables/types";
import { ColorObject, Colors } from "../util";
import { isReference, resolveReference } from "./resolveReference";

export const resolveColor = (color: Color | Reference, colors: Record<string, Color | Reference>): ColorObject => {
    if (color.startsWith('#'))
        return Colors.toObject(color as Color);
    else if (isReference(color))
        return resolveColor(resolveReference(color, colors, v => typeof v === 'string' && v.startsWith('#')), colors);

    else
        throw new Error(`Invalid color: ${color}`);
};
