import { SheetHeaderStyle } from "./sheets/SheetColumns";
import { SheetStyle } from "./sheets/SheetStyle";
import { SheetGenerator } from "./sheets/SheetGenerator";
import { Color, Partition, Reference, Style, TableBook, Theme } from "./tables/types";
import { ColorObject, Colors } from "./util/Color";


type ResolvedColumn = {
    sheet: string;
    group: boolean;
    index: number;
};

export const resolveColumns = (tablebook: TableBook): Map<string, ResolvedColumn> => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    for (let s = 0; s < tablebook.sheets.length; s++) {

        const sheet = tablebook.sheets[s];

        for (let g = 0; g < sheet.groups.length; g++) {
            const group = sheet.groups[g];

            for (let c = 0; c < group.columns.length; c++) {
                const column = group.columns[c];

                const fullname = sheet.groups.length > 1 ? `${sheet.name}.${group.name}.${column.name}` : `${sheet.name}.${column.name}`;

                if (resolved.has(fullname))
                    throw new Error(`Duplicate column name: ${fullname}`);

                resolved.set(fullname, { sheet: sheet.name, group: sheet.groups.length > 1, index: c });
            }
        }
    }

    return resolved;
};

export const resolveColors = (color: Color | Reference, colors: Record<string, Color>): ColorObject => {
    if (color.startsWith('#'))
        return Colors.toObject(color as Color);
    else if (color.startsWith('@')) {
        const resolved = colors[color.substring(1)];
        if (resolved)
            return Colors.toObject(resolved);
        else
            throw new Error(`Invalid reference: ${color}`);
    }
    else
        throw new Error(`Invalid color: ${color}`);
};

export const resolveStyle = (style: Style | Reference, colors: Record<string, Color>, styles: Record<string, Style>): SheetStyle => {
    if (typeof style === 'string') {
        if (style.startsWith('@')) {
            const resolved = styles[style.substring(1)];
            if (resolved)
                return resolveStyle(resolved, colors, styles);
        }

        throw new Error(`Invalid reference: ${style}`);
    }

    const fore: ColorObject | undefined = style.fore ? Colors.toObject(resolveColors(style.fore, colors)) : undefined;
    const back: ColorObject | undefined = style.back ? Colors.toObject(resolveColors(style.back, colors)) : undefined;

    let bold, italic;
    if (typeof style.form === 'boolean') {
        bold = italic = style.form;
    }
    else if (style.form !== undefined) {
        bold = style.form.bold;
        italic = style.form.italic;
    }

    return { fore, back, bold, italic };
};

type SheetTheme = {
    tab: ColorObject,
    header: SheetHeaderStyle,
    group: SheetHeaderStyle,
    data: SheetStyle;
};

export const resolveTheme = (
    theme: Theme | Reference,
    colors: Record<string, Color>,
    styles: Record<string, Style>,
    themes: Record<string, Theme>,
    parents: Theme[]
): SheetTheme => {

    // need to resolve theme, inheriting from parents and theme.inherits - deep overrides - but erroring it circular references

};

export const process = (tablebook: TableBook, generator: SheetGenerator) => {
    const resolved = resolveColumns(tablebook);
};


