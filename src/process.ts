import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "./sheets/SheetBook";
import { SheetType } from "./sheets/SheetKind";
import { SheetBorder, SheetStyle, SheetTitleStyle } from "./sheets/SheetStyle";
import { Color, ColumnType, HeaderStyle, Reference, Style, TableBook, Theme } from "./tables/types";
import { standardColors, StandardPalettes, standardThemes } from "./tables/palettes";
import { ColorObject, Colors } from "./util/Color";


type ResolvedColumn = {
    sheet: string;
    group: boolean;
    index: number;
};

const isReference = (value: unknown): value is Reference => typeof value === 'string' && value.startsWith('@');

const resolveReference = <T>(ref: Reference, map: Record<string, T | Reference>, is: (value: unknown) => boolean): T => {
    const visited = [ref];

    const checker = is as (value: unknown) => value is T;

    while (true) {
        const result = map[ref.substring(1)];

        if (result === undefined)
            throw new Error(`Missing reference: ${ref}`);
        else if (checker(result))
            return result as T;
        else if (isReference(result)) {
            if (visited.includes(result))
                throw new Error(`Circular reference: ${Array.from(visited).join(' -> ')}`);

            visited.push(result);

            ref = result;
        }
        else
            throw new Error(`Invalid reference: ${ref}`);
    }
};


const resolveColumns = (tablebook: TableBook): Map<string, ResolvedColumn> => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    const sheets = new Set<string>();

    for (let s = 0; s < tablebook.pages.length; s++) {

        const sheet = tablebook.pages[s];

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

const resolveColor = (color: Color | Reference, colors: Record<string, Color | Reference>): ColorObject => {
    if (color.startsWith('#'))
        return Colors.toObject(color as Color);
    else if (isReference(color))
        return resolveColor(resolveReference(color, colors, v => typeof v === 'string' && v.startsWith('#')), colors);
    else
        throw new Error(`Invalid color: ${color}`);
};

const resolveStyle = (style: HeaderStyle | Reference, colors: Record<string, Color | Reference>, styles: Record<string, Style | Reference>): SheetTitleStyle => {
    if (isReference(style))
        return resolveStyle(resolveReference(style, styles, v => typeof v === 'object'), colors, styles);

    const fore: ColorObject | undefined = style.fore ? resolveColor(style.fore, colors) : undefined;
    const back: ColorObject | undefined = style.back ? resolveColor(style.back, colors) : undefined;

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
            color: style.beneath.color ? resolveColor(style.beneath.color, colors) : undefined
        };

    let between: SheetBorder | undefined;
    if (style.between)
        between = {
            type: style.between.type,
            color: style.between.color ? resolveColor(style.between.color, colors) : undefined
        };


    return { fore, back, bold, italic, beneath, between };
};

type SheetTheme = {
    tab?: ColorObject | null,
    group: SheetTitleStyle,
    header: SheetTitleStyle,
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

const resolveTheme = (
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

export const processTableBook = (book: TableBook): SheetBook => {

    console.log(`Processing book: '${book.name}'`);

    const resultBook: SheetBook = {
        title: book.name,
        pages: []
    };

    const resolved = resolveColumns(book);

    const colors = { ...(book.definitions?.colors ?? {}), ...standardColors };
    const styles = book.definitions?.styles ?? {};
    const themes = { ...(book.definitions?.themes ?? {}), ...standardThemes };
    const numeric = book.definitions?.formats?.numeric ?? {};
    const temporal = book.definitions?.formats?.temporal ?? {};
    const types = book.definitions?.types ?? {};

    for (const page of book.pages) {

        console.log(`Processing page: '${page.name}'`);

        const pageParents: (Theme | Reference)[] = book.theme ? [book.theme] : [];

        const pageTheme = resolveTheme(page.name, page.theme ?? {}, colors, styles, themes, pageParents);


        const resultPage: SheetPage = {
            title: page.name,
            tabColor: pageTheme.tab ?? undefined,
            rows: page.rows,
            groups: []
        };

        resultBook.pages.push(resultPage);


        for (const group of page.groups) {
            console.log(`Processing group: '${group.name}'`);

            const groupParents = [...pageParents, ...(page.theme ? [page.theme] : [])];

            const groupTheme = resolveTheme(`${page.name}.${group.name}`, group.theme ?? {}, colors, styles, themes, groupParents);

            const resultGroup: SheetGroup = {
                title: group.name,
                titleStyle: groupTheme.group,
                columns: []
            };

            resultPage.groups.push(resultGroup);

            for (const column of group.columns) {
                console.log(`Processing column: '${column.name}'`);

                const columnParents = [...groupParents, ...(group.theme ? [group.theme] : [])];

                const columnTheme = resolveTheme(`${page.name}.${group.name}.${column.name}`, column.theme ?? {}, colors, styles, themes, columnParents);



                const type = isReference(column.type) ? resolveReference(column.type, types, v => typeof v === 'string') : column.type;

                type.name;

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.header,
                    dataStyle: columnTheme.data,
                    type: undefined,
                    format: undefined,
                    conditionalFormats: undefined,
                    formula: undefined,
                    validation: undefined
                };

                resultGroup.columns.push(resultColumn);
            }
        }
    };

    return resultBook;
};