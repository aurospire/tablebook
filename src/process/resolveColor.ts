import { TableBookProcessIssue } from "../issues";
import { TableColor, TableReference } from "../tables/types";
import { ColorObject, Colors, ObjectPath, Result } from "../util";
import { isReference, TableReferenceRegistry } from "./ReferenceRegistry";

export const resolveColor = (
    color: TableColor | TableReference,
    colors: TableReferenceRegistry<TableColor>,
    path: ObjectPath
): Result<ColorObject, TableBookProcessIssue[]> => {

    if (color.startsWith('#')) {
        return Result.success(Colors.toObject(color as TableColor));
    }
    else if (isReference(color)) {
        const result = colors.resolve(color, path);
        if (result.success)
            return Result.success(Colors.toObject(result.value as TableColor));
        else
            return Result.failure(result.info);
    }
    else {
        return Result.failure([{ type: 'processing', message: 'Invalid color', path, data: color }]);
    }
};
