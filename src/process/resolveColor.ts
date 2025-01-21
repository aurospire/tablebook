import { TableBookProcessIssue } from "../issues";
import { TableColor, TableReference } from "../tables/types";
import { ColorObject, Colors, ObjectPath, Result } from "../util";
import { isReference, resolveReference } from "./resolveReference";

export const resolveColor = (
    color: TableColor | TableReference,
    colors: Record<string, TableColor | TableReference>,
    path: ObjectPath
): Result<ColorObject, TableBookProcessIssue[]> => {

    if (color.startsWith('#')) {
        return Result.success(Colors.toObject(color as TableColor));
    }
    else if (isReference(color)) {
        const result = resolveReference(color, colors, v => typeof v === 'string' && v.startsWith('#'), path);
        if (result.success)
            return Result.success(Colors.toObject(result.value as TableColor));
        else
            return Result.failure(result.info);
    }
    else {
        return Result.failure([{ type: 'processing', message: 'Invalid color', path, data: color }]);
    }
};
