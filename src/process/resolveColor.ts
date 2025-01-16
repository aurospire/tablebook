import { TableBookProcessIssue } from "../issues";
import { Color, Reference } from "../tables/types";
import { ColorObject, Colors, ObjectPath, Result } from "../util";
import { isReference, resolveReference } from "./resolveReference";

export const resolveColor = (
    color: Color | Reference,
    colors: Record<string, Color | Reference>,
    path: ObjectPath
): Result<ColorObject, TableBookProcessIssue[]> => {

    if (color.startsWith('#')) {
        return Result.success(Colors.toObject(color as Color));
    }
    else if (isReference(color)) {
        const result = resolveReference(color, colors, v => typeof v === 'string' && v.startsWith('#'), path);
        if (result.success)
            return Result.success(Colors.toObject(result.value as Color));
        else
            return Result.failure(result.info);
    }
    else {
        return Result.failure([{ type: 'processing', message: 'Invalid color', path, data: color }]);
    }
};
