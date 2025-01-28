import { TableBookProcessIssue } from "../issues";
import { SheetTitleStyle, SheetStyle } from "../sheets";
import { TableTheme, TableReference, TableColor, TableStyle } from "../tables/types";
import { ColorObject, ObjectPath, Result } from "../util";
import { resolveColor } from "./resolveColor";
import { isReference, ReferenceRegistry } from "./ReferenceRegistry";
import { resolveStyle } from "./resolveStyle";

export type SheetTheme = {
    tab?: ColorObject | null;
    group: SheetTitleStyle;
    header: SheetTitleStyle;
    data: SheetStyle;
};

export const mergeThemes = (base: SheetTheme, override: SheetTheme): SheetTheme => {
    return {
        tab: override.tab ?? base.tab,
        header: {
            fore: override.header.fore ?? base.header.fore,
            back: override.header.back ?? base.header.back,
            bold: override.header.bold ?? base.header.bold,
            italic: override.header.italic ?? base.header.italic,
            beneath: override.header.beneath ?? base.header.beneath,
            between: override.header.between ?? base.header.between
        },
        group: {
            fore: override.group.fore ?? base.group.fore,
            back: override.group.back ?? base.group.back,
            bold: override.group.bold ?? base.group.bold,
            italic: override.group.italic ?? base.group.italic,
            beneath: override.group.beneath ?? base.group.beneath,
            between: override.group.between ?? base.group.between
        },
        data: {
            fore: override.data.fore ?? base.data.fore,
            back: override.data.back ?? base.data.back,
            bold: override.data.bold ?? base.data.bold,
            italic: override.data.italic ?? base.data.italic
        }
    };
};

export const resolveTheme = (
    theme: TableTheme | TableReference,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    themes: ReferenceRegistry<TableTheme>,
    parents: (TableTheme | TableReference)[],
    chain: TableTheme[],
    path: ObjectPath
): Result<SheetTheme, TableBookProcessIssue[]> => {
    let resolved: TableTheme = {};
    const issues: TableBookProcessIssue[] = [];

    if (isReference(theme)) {
        const result = themes.resolve(theme, path);

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

        const resolvedParent = resolveTheme(parent, colors, styles, themes, [], [], path);

        if (resolvedParent.success)
            result = mergeThemes(result, resolvedParent.value);
        else
            issues.push(...resolvedParent.info);
    }

    if (resolved.inherits) {
        const branchChain = [...chain, resolved];

        for (let i = 0; i < resolved.inherits.length; i++) {
            const inherit = resolved.inherits[i];

            const resolvedInherit = resolveTheme(inherit, colors, styles, themes, [], branchChain, path);

            if (resolvedInherit.success)
                result = mergeThemes(result, resolvedInherit.value);
            else
                issues.push(...resolvedInherit.info);
        }
    }


    let tab: ColorObject | undefined;
    if (resolved.tab) {
        const result = resolveColor(resolved.tab, colors, path);

        if (result.success)
            tab = result.value;
        else
            issues.push(...result.info);
    }

    let header: SheetTitleStyle | undefined;
    if (resolved.header) {
        const result = resolveStyle(resolved.header, colors, styles, path);

        if (result.success)
            header = result.value;
        else
            issues.push(...result.info);
    }


    let group: SheetTitleStyle | undefined;
    if (resolved.group) {
        const result = resolveStyle(resolved.group, colors, styles, path);

        if (result.success)
            group = result.value;
        else
            issues.push(...result.info);
    }

    let data: SheetStyle | undefined;
    if (resolved.data) {
        const result = resolveStyle(resolved.data, colors, styles, path);

        if (result.success)
            data = result.value;
        else
            issues.push(...result.info);
    }

    result = mergeThemes(result, { tab, header: header ?? {}, group: group ?? {}, data: data ?? {} });

    return issues.length === 0 ? Result.success(result) : Result.failure(issues, result);
};
