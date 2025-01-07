import { SheetHeaderStyle } from "./sheets/SheetColumns";
import { SheetGenerator } from "./sheets/SheetGenerator";
import { SheetBorder, SheetStyle } from "./sheets/SheetStyle";
import { Color, HeaderStyle, Reference, StandardPalettes, Style, TableBook, Theme } from "./tables/types";
import { ColorObject, Colors } from "./util/Color";


type ResolvedColumn = {
    sheet: string;
    group: boolean;
    index: number;
};

export const resolveColumns = (tablebook: TableBook): Map<string, ResolvedColumn> => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    const sheets = new Set<string>();

    for (let s = 0; s < tablebook.sheets.length; s++) {

        const sheet = tablebook.sheets[s];

        if (sheets.has(sheet.name))
            throw new Error(`Duplicate sheet name: ${sheet.name}`);

        sheets.add(sheet.name);

        const groups = new Set<string>();

        for (let g = 0; g < sheet.groups.length; g++) {
            const group = sheet.groups[g];

            if (groups.has(group.name))
                throw new Error(`Duplicate group name: ${group.name}`);

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
    if (color.startsWith('#')) {
        return Colors.toObject(color as Color);
    }
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

export const resolveStyle = (style: HeaderStyle | Reference, colors: Record<string, Color>, styles: Record<string, Style>): SheetHeaderStyle => {
    if (typeof style === 'string') {
        if (style.startsWith('@')) {
            const resolved = styles[style.substring(1)];
            if (resolved)
                return resolveStyle(resolved, colors, styles);
        }

        throw new Error(`Invalid reference: ${style}`);
    }

    const fore: ColorObject | undefined = style.fore ? resolveColors(style.fore, colors) : undefined;
    const back: ColorObject | undefined = style.back ? resolveColors(style.back, colors) : undefined;

    let bold, italic;

    if (typeof style.form === 'boolean') {
        bold = italic = style.form;
    }
    else if (style.form !== undefined) {
        bold = style.form.bold;
        italic = style.form.italic;
    }

    let beneath: SheetBorder | undefined;
    if (style.beneath)
        beneath = {
            type: style.beneath.type,
            color: style.beneath.color ? resolveColors(style.beneath.color, colors) : undefined
        };

    let between: SheetBorder | undefined;
    if (style.between)
        between = {
            type: style.between.type,
            color: style.between.color ? resolveColors(style.between.color, colors) : undefined
        };


    return { fore, back, bold, italic, beneath, between };
};

type SheetTheme = {
    tab?: ColorObject | null,
    header: SheetHeaderStyle,
    group: SheetHeaderStyle,
    data: SheetStyle;
};

const resolveTheme = (
    name: string,
    theme: Theme | Reference,
    colors: Record<string, Color>,
    styles: Record<string, Style>,
    themes: Record<string, Theme>,
    parents: (Theme | Reference)[],
    chain: Theme[] = []
): SheetTheme => {
    if (typeof theme === 'string') {
        if (theme.startsWith('@')) {
            const resolved = themes[theme.substring(1)];
            if (resolved)
                return resolveTheme(name, resolved, colors, styles, themes, parents, chain);
        }

        throw new Error(`Invalid reference: ${theme}`);
    }

    if (chain.includes(theme))
        throw new Error('Circular theme reference for ' + name + JSON.stringify({ chain, theme }, null, 2));

    const branchChain = [...chain, theme];

    const inherits = [...parents, ...(theme.inherits ?? [])];

    let result: SheetTheme = {
        tab: undefined,
        header: {},
        group: {},
        data: {}
    };

    for (let i = 0; i < inherits.length; i++) {
        const inherit = inherits[i];
        const resolved = resolveTheme(`${name}:${i}`, inherit, colors, styles, themes, [], branchChain);

        result = {
            tab: resolved.tab ?? result.tab,
            header: { ...result.header, ...resolved.header },
            group: { ...result.group, ...resolved.group },
            data: { ...result.data, ...resolved.data }
        };
    }

    if (theme.tab)
        result.tab = resolveColors(theme.tab, colors);
    if (theme.header)
        result.header = { ...result.header, ...resolveStyle(theme.header, colors, styles) };
    if (theme.group)
        result.group = { ...result.group, ...resolveStyle(theme.group, colors, styles) };
    if (theme.data)
        result.data = { ...result.data, ...resolveStyle(theme.data, colors, styles) };

    return result;
};

const standardColors: Record<string, Color> = Object.fromEntries(
    Object.entries(StandardPalettes).map(([key, palette]) => [key, palette.main])
);

const standardThemes: Record<string, Theme> = Object.fromEntries(
    Object.entries(StandardPalettes).map(([key, palette]) => [key, {
        tab: palette.main,
        group: { back: palette.darkest },
        header: { back: palette.dark },
        data: { back: palette.lightest },
    }])
);
export const processTableBook = async (book: TableBook, generator: SheetGenerator) => {
    const resolved = resolveColumns(book);

    console.log(`Processing book: '${book.name}'`);
    generator.setTitle(book.name);

    const colors = { ...(book.definitions?.colors ?? {}), ...standardColors };
    const styles = book.definitions?.styles ?? {};
    const themes = { ...(book.definitions?.themes ?? {}), ...standardThemes };
    const numeric = book.definitions?.formats?.numeric ?? {};
    const temporal = book.definitions?.formats?.temporal ?? {};
    const types = book.definitions?.types ?? {};


    for (const sheet of book.sheets) {
        const sheetParents: (Theme | Reference)[] = book.theme ? [book.theme] : [];
        const sheetTheme = resolveTheme(sheet.name, sheet.theme ?? {}, colors, styles, themes, sheetParents);

        const columns: number = sheet.groups.reduce((acc, group) => acc + group.columns.length, 0);

        console.log(`Processing sheet: '${sheet.name}' ${columns} columns, ${sheet.rows} rows`);

        console.log(sheetTheme);

        const sheetId = await generator.addSheet(sheet.name, sheet.rows, columns, sheetTheme.tab || undefined);

        let index = 0;

        for (const group of sheet.groups) {
            const groupParents = [...sheetParents, ...(sheet.theme ? [sheet.theme] : [])];

            const groupTheme = resolveTheme(sheet.name + '.' + group.name, group.theme ?? {}, colors, styles, themes, groupParents);

            const grouped = sheet.groups.length > 1;

            if (grouped) {
                console.log(`Processing group: '${group.name}' ${group.columns.length} columns`);
                console.log(groupTheme);
                await generator.addGroup(sheetId, group.name, index, group.columns.length, groupTheme.group);
            }

            for (const column of group.columns) {
                await generator.addColumn(sheetId, column.name, index, grouped, {});

                index++;
            }
        }
    };

};