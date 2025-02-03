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
    parents: (TableTheme | TableReference)[],
    chain: TableTheme[],
    path: ObjectPath
): Result<SheetTheme, TableBookProcessIssue[]> => {
    let resolved: TableTheme = {};
    const issues: TableBookProcessIssue[] = [];

    if (isReference(theme)) {
        const result = definitions.themes.resolve(theme, path);

        if (result.success)
            resolved = result.value;
        else
            issues.push(...result.info);
    }
    else {
        resolved = theme;
    }

    if (chain.includes(resolved))
        throw new Error('Circular theme reference for ' + JSON.stringify({ chain, theme }, null, 2));

    let result: SheetTheme = {
        tab: undefined,
        header: {},
        group: {},
        data: {}
    };

    for (let i = 0; i < parents.length; i++) {
        const parent = parents[i];

        const resolvedParent = resolveTheme(parent, definitions, [], [], path);

        if (resolvedParent.success)
            result = mergeThemes(result, resolvedParent.value);
        else
            issues.push(...resolvedParent.info);
    }

    if (resolved.inherits) {
        const branchChain = [...chain, resolved];

        for (let i = 0; i < resolved.inherits.length; i++) {
            const inherit = resolved.inherits[i];

            const resolvedInherit = resolveTheme(inherit, definitions, [], branchChain, path);

            if (resolvedInherit.success)
                result = mergeThemes(result, resolvedInherit.value);
            else
                issues.push(...resolvedInherit.info);
        }
    }


    let tab: ColorObject | undefined;
    if (resolved.tab) {
        const result = resolveColor(resolved.tab, definitions, path);

        if (result.success)
            tab = result.value;
        else
            issues.push(...result.info);
    }

    let header: SheetTitleStyle | undefined;
    if (resolved.header) {
        const result = resolveStyle(resolved.header, definitions, path);

        if (result.success)
            header = result.value;
        else
            issues.push(...result.info);
    }


    let group: SheetTitleStyle | undefined;
    if (resolved.group) {
        const result = resolveStyle(resolved.group, definitions, path);

        if (result.success)
            group = result.value;
        else
            issues.push(...result.info);
    }

    let data: SheetStyle | undefined;
    if (resolved.data) {
        const result = resolveStyle(resolved.data, definitions, path);

        if (result.success)
            data = result.value;
        else
            issues.push(...result.info);
    }

    result = mergeThemes(result, { tab, header: header ?? {}, group: group ?? {}, data: data ?? {} });

    return issues.length === 0 ? Result.success(result) : Result.failure(issues, result);
};
