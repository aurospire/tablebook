import { TableBookProcessIssue } from "../issues";
import { SheetStyle, SheetTitleStyle } from "../sheets";
import { isReference } from "../tables";
import { TableReference, TableTheme } from "../tables/types";
import { ColorObject, ObjectPath, Result } from "../util";
import { TableDefinitionsManager } from "./DefinitionsRegistry";
import { resolveColor } from "./resolveColor";
import { resolveStyle } from "./resolveStyle";

export type SheetTheme = {
    tab?: ColorObject | null;
    group: SheetTitleStyle;
    header: SheetTitleStyle;
    data: SheetStyle;
};

export const mergeStyles = (base: SheetTitleStyle, override: SheetTitleStyle, full: boolean): SheetTitleStyle => {
    return {
        fore: override.fore ?? base.fore,
        back: override.back ?? base.back,
        bold: override.bold ?? base.bold,
        italic: override.italic ?? base.italic,
        beneath: full ? override.beneath ?? base.beneath : undefined,
        between: full ? override.between ?? base.between : undefined
    };
};

export const mergeThemes = (base: SheetTheme, override: SheetTheme): SheetTheme => {
    return {
        tab: override.tab ?? base.tab,
        header: mergeStyles(base.header, override.header, true),
        group: mergeStyles(base.group, override.group, true),
        data: mergeStyles(base.data, override.data, false)
    };
};

export const resolveTheme = (
    theme: TableTheme | TableReference,
    definitions: TableDefinitionsManager,
    parents: SheetTheme[],
    chain: TableTheme[],
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetTheme => {
    const resolvedTheme: TableTheme =
        isReference(theme)
            ? Result.unwrap(definitions.themes.resolve(theme, path), (info) => { issues.push(...info); return {}; })
            : theme;

    if (chain.includes(resolvedTheme))
        throw new Error('Circular theme reference for ' + JSON.stringify({ chain, theme }, null, 2));

    let result: SheetTheme = {
        tab: undefined,
        header: {},
        group: {},
        data: {}
    };

    for (const parent of parents)
        result = mergeThemes(result, parent);

    if (resolvedTheme.inherits) {
        const branchChain = [...chain, resolvedTheme];

        for (let i = 0; i < resolvedTheme.inherits.length; i++) {
            const inherit = resolvedTheme.inherits[i];

            const resolvedInherit = resolveTheme(inherit, definitions, [], branchChain, path, issues);

            result = mergeThemes(result, resolvedInherit);
        }
    }

    const tab = resolvedTheme.tab
        ? resolveColor(resolvedTheme.tab, definitions, path, issues)
        : undefined;

    const group = resolvedTheme.group ? resolveStyle(resolvedTheme.group, definitions, path, issues) : undefined;

    const header = resolvedTheme.header ? resolveStyle(resolvedTheme.header, definitions, path, issues) : undefined;

    const data = resolvedTheme.data ? resolveStyle(resolvedTheme.data, definitions, path, issues) : undefined;


    result = mergeThemes(result, { tab, header: header ?? {}, group: group ?? {}, data: data ?? {} });

    return result;
};
