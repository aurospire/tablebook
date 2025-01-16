import { TableBookPath, TableBookProcessIssue, TableBookResult } from "../issues";
import { SheetTitleStyle, SheetBorder } from "../sheets";
import { HeaderStyle, Reference, Color, Style } from "../tables/types";
import { ColorObject } from "../util";
import { resolveColor } from "./resolveColor";
import { isReference, resolveReference } from "./resolveReference";

export const resolveStyle = (
    style: HeaderStyle | Reference,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    path: TableBookPath
): TableBookResult<SheetTitleStyle, TableBookProcessIssue> => {
    let resolved: HeaderStyle;

    const issues: TableBookProcessIssue[] = [];

    if (isReference(style)) {
        const result = resolveReference(style, styles, v => typeof v === 'object', path);

        if (!result.success)
            return { success: false, issues: result.issues };

        resolved = result.data;
    }
    else {
        resolved = style;
    }

    let fore: ColorObject | undefined;
    if (resolved.fore) {
        const result = resolveColor(resolved.fore, colors, path);

        if (result.success)
            fore = result.data;
        else
            issues.push(...result.issues);
    }

    let back: ColorObject | undefined;
    if (resolved.back) {
        const result = resolveColor(resolved.back, colors, path);

        if (result.success)
            back = result.data;
        else
            issues.push(...result.issues);
    }


    const bold: boolean | undefined = resolved.bold;

    const italic: boolean | undefined = resolved.italic;

    let beneath: SheetBorder | undefined;
    if (resolved.beneath) {
        const result = resolveColor(resolved.beneath.color, colors, path);

        if (result.success)
            beneath = {
                type: resolved.beneath.type,
                color: result.data
            };
        else
            issues.push(...result.issues);
    }

    let between: SheetBorder | undefined;
    if (resolved.between) {
        const result = resolveColor(resolved.between.color, colors, path);

        if (result.success)
            between = {
                type: resolved.between.type,
                color: result.data
            };
        else
            issues.push(...result.issues);
    }

    const result = { fore, back, bold, italic, beneath, between };

    return issues.length ? { success: true, data: result } : { success: false, issues };
};
