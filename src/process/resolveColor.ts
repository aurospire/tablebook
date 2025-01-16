import { TableBookPath, TableBookProcessIssue, TableBookResult } from "../issues";
import { Color, Reference } from "../tables/types";
import { ColorObject, Colors } from "../util";
import { isReference, resolveReference } from "./resolveReference";

export const resolveColor = (color: Color | Reference, colors: Record<string, Color | Reference>, path: TableBookPath): TableBookResult<ColorObject, TableBookProcessIssue> => {
    if (color.startsWith('#'))
        return { success: true, data: Colors.toObject(color as Color) };
    else if (isReference(color)) {
        const result = resolveReference(color, colors, v => typeof v === 'string' && v.startsWith('#'), path);
        if (result.success)
            return { success: true, data: Colors.toObject(result.data as Color) };
        else
            return { success: false, issues: result.issues };
    }
    else
        return { success: false, issues: [{ type: 'processing', message: 'Invalid color', path, data: color }] };
};
