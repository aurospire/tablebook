import { TableBookProcessIssue } from "../issues";
import { SheetBorder, SheetTitleStyle } from "../sheets";
import { TableColor, TableHeaderStyle, TableReference, TableStyle } from "../tables/types";
import { ColorObject, ObjectPath, Result } from "../util";
import { resolveColor } from "./resolveColor";
import { isReference, resolveReference } from "./resolveReference";

export const resolveStyle = (
    style: TableHeaderStyle | TableReference,
    colors: Record<string, TableColor | TableReference>,
    styles: Record<string, TableStyle | TableReference>,
    path: ObjectPath
): Result<SheetTitleStyle, TableBookProcessIssue[]> => {
    let resolved: TableHeaderStyle;

    const issues: TableBookProcessIssue[] = [];

    if (isReference(style)) {
        const result = resolveReference(style, styles, v => typeof v === 'object', path);

        if (!result.success)
            return Result.failure(result.info);

        resolved = result.value;
    }
    else {
        resolved = style;
    }

    let fore: ColorObject | undefined;
    if (resolved.fore) {
        const result = resolveColor(resolved.fore, colors, path);

        if (result.success)
            fore = result.value;
        else
            issues.push(...result.info);
    }

    let back: ColorObject | undefined;
    if (resolved.back) {
        const result = resolveColor(resolved.back, colors, path);

        if (result.success)
            back = result.value;
        else
            issues.push(...result.info);
    }


    const bold: boolean | undefined = resolved.bold;

    const italic: boolean | undefined = resolved.italic;

    let beneath: SheetBorder | undefined;
    if (resolved.beneath) {
        const result = resolveColor(resolved.beneath.color, colors, path);

        if (result.success)
            beneath = {
                type: resolved.beneath.type,
                color: result.value
            };
        else
            issues.push(...result.info);
    }

    let between: SheetBorder | undefined;
    if (resolved.between) {
        const result = resolveColor(resolved.between.color, colors, path);

        if (result.success)
            between = {
                type: resolved.between.type,
                color: result.value
            };
        else
            issues.push(...result.info);
    }

    const result = { fore, back, bold, italic, beneath, between };

    return issues.length === 0 ? Result.success(result) : Result.failure(issues, result);
};
