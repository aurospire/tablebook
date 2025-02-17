import { TableBookProcessIssue } from "../issues";
import { isReference } from "../tables";
import { TableColor, TableReference } from "../tables/types";
import { ColorObject, Colors, ObjectPath } from "../util";
import { TableDefinitionsManager } from "./DefinitionsRegistry";

export const resolveColor = (
    color: TableColor | TableReference,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): ColorObject | undefined => {

    if (color.startsWith('#')) {
        return Colors.toObject(color as TableColor);
    }
    else if (isReference(color)) {
        const result = definitions.colors.resolve(color, path);
        
        if (result.success)
            return Colors.toObject(result.value as TableColor);
        else
            issues.push(...result.info);
    }
    else {
        issues.push({ type: 'processing', message: 'Invalid color', path, data: color });
    }
};
