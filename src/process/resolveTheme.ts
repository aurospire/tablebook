import { SheetTitleStyle, SheetStyle } from "../sheets";
import { Theme, Reference, Color, Style } from "../tables/types";
import { ColorObject } from "../util";
import { resolveColor } from "./resolveColor";
import { isReference, resolveReference } from "./resolveReference";
import { resolveStyle } from "./resolveStyle";

type SheetTheme = {
    tab?: ColorObject | null;
    group: SheetTitleStyle;
    header: SheetTitleStyle;
    data: SheetStyle;
};
const mergeThemes = (base: SheetTheme, override: SheetTheme): SheetTheme => {
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
    name: string,
    theme: Theme | Reference,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    themes: Record<string, Theme | Reference>,
    parents: (Theme | Reference)[],
    chain: Theme[] = []
): SheetTheme => {
    if (isReference(theme))
        return resolveTheme(name, resolveReference(theme, themes, v => typeof v === 'object'), colors, styles, themes, parents, chain);

    if (chain.includes(theme))
        throw new Error('Circular theme reference for ' + name + JSON.stringify({ chain, theme }, null, 2));

    let result: SheetTheme = {
        tab: undefined,
        header: {},
        group: {},
        data: {}
    };

    for (let i = 0; i < parents.length; i++) {
        const parent = parents[i];
        const subname = `${name}:parent[${i}]`;
        const resolved = resolveTheme(subname, parent, colors, styles, themes, [], []);

        result = mergeThemes(result, resolved);
    }

    if (theme.inherits) {
        const branchChain = [...chain, theme];

        for (let i = 0; i < theme.inherits.length; i++) {
            const inherit = theme.inherits[i];
            const subname = `${name}:inherits[${i}]`;
            const resolved = resolveTheme(subname, inherit, colors, styles, themes, [], branchChain);

            result = mergeThemes(result, resolved);
        }
    }

    result = mergeThemes(result, {
        tab: theme.tab ? resolveColor(theme.tab, colors) : undefined,
        header: theme.header ? resolveStyle(theme.header, colors, styles) : {},
        group: theme.group ? resolveStyle(theme.group, colors, styles) : {},
        data: theme.data ? resolveStyle(theme.data, colors, styles) : {},
    });

    return result;
};
