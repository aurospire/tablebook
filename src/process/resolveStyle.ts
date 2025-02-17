import { TableBookProcessIssue } from "../issues";
import { SheetBorder, SheetTitleStyle } from "../sheets";
import { isReference } from "../tables";
import { TableBorder, TableHeaderStyle, TableReference } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { TableDefinitionsManager } from "./DefinitionsRegistry";
import { resolveColor } from "./resolveColor";

const resolveBorder = (
    border: TableBorder | undefined,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBorder | undefined => {
    if (border) {
        const color = resolveColor(border.color, definitions, path, issues);

        return color ? { type: border.type, color } : undefined;
    }
};

export const resolveStyle = (
    style: TableHeaderStyle | TableReference,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetTitleStyle | undefined => {

    const resolvedStyle: TableHeaderStyle | undefined = isReference(style)
        ? Result.unwrap(definitions.styles.resolve(style, path), (info) => { issues.push(...info); return {}; })
        : style;

    const result : SheetTitleStyle = {
        fore : resolvedStyle.fore ? resolveColor(resolvedStyle.fore, definitions, path, issues) : undefined,
        back : resolvedStyle.back ? resolveColor(resolvedStyle.back, definitions, path, issues) : undefined,

        bold: resolvedStyle.bold,
        italic: resolvedStyle.italic,
        
        beneath : resolveBorder(resolvedStyle.beneath, definitions, path, issues),
        between : resolveBorder(resolvedStyle.between, definitions, path, issues),
    }

    return result
};
