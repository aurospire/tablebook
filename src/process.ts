import { inspect } from "util";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "./sheets/SheetBook";
import { SheetSelector } from "./sheets/SheetPosition";
import { SheetBorder, SheetStyle, SheetTitleStyle } from "./sheets/SheetStyle";
import { standardColors, standardThemes } from "./tables/palettes";
import { Color, DataSelector, Expression, HeaderStyle, Reference, Style, TableBook, Theme, UnitSelector } from "./tables/types";
import { ColorObject, Colors } from "./util/Color";


type ResolvedColumn = {
    page: string;
    grouped: boolean;
    index: number;
};

const lookupName = (page: string, group: string, name: string) => `${page}.${group}.${name}`;

const resolveColumns = (tablebook: TableBook): Map<string, ResolvedColumn> => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    const pages = new Set<string>();

    for (let s = 0; s < tablebook.pages.length; s++) {

        const page = tablebook.pages[s];

        if (pages.has(page.name))
            throw new Error(`Duplicate page name: ${page.name}`);

        pages.add(page.name);

        const groups = new Set<string>();
        let index = 0;

        for (let g = 0; g < page.groups.length; g++) {
            const group = page.groups[g];

            if (groups.has(group.name))
                throw new Error(`Duplicate group name: ${group.name}`);

            for (let c = 0; c < group.columns.length; c++) {
                const column = group.columns[c];

                const fullname = lookupName(page.name, group.name, column.name);

                if (resolved.has(fullname))
                    throw new Error(`Duplicate column name: ${fullname}`);

                resolved.set(fullname, { page: page.name, grouped: page.groups.length > 1, index: index++ });
            }
        }
    }

    return resolved;
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
    const bold: boolean | undefined = style.bold;
    const italic: boolean | undefined = style.bold;

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

const modifyUnitSelector = (selector: UnitSelector, grouped: boolean): UnitSelector => {
    if (selector[0] !== '$')
        return selector;

    const value = Number(selector.slice(1));

    return `$${value + (grouped ? 2 : 1)}`;
};

const resolveExpression = (expression: Expression<DataSelector>, page: string, group: string, name: string, columns: Map<string, ResolvedColumn>): Expression<SheetSelector> => {
    switch (expression.type) {
        case "literal":
            return expression;
        case "function":
            return {
                type: "function",
                name: expression.name,
                args: expression.args.map(arg => resolveExpression(arg, page, group, name, columns))
            };
        case "compound":
            return {
                type: "compound",
                with: expression.with,
                items: expression.items.map(item => resolveExpression(item, page, group, name, columns))
            };
        case "negated":
            return {
                type: 'negated',
                on: resolveExpression(expression.on, page, group, name, columns)
            };
        case "selector": {
            console.log("\n\n*** SELECTOR ***");
            console.log(expression.from);
            const { column, row } = expression.from === 'self' ? { column: 'self', row: 'self' } : expression.from;

            let selectedPage: string | undefined;
            let selectedColumn: ResolvedColumn;

            if (typeof column === 'string')
                selectedColumn = columns.get(lookupName(page, group, name))!;
            else {
                const fullname = lookupName(
                    column.page ?? page,
                    column.group ?? group,
                    column.name
                );

                if (!columns.has(fullname))
                    throw new Error(`Invalid column: ${fullname}`);

                selectedColumn = columns.get(fullname)!;

                selectedPage = column.page;
            }

            console.log(selectedColumn);
            let selectedRowStart: UnitSelector;
            let selectedRowEnd: UnitSelector | undefined;

            if (typeof row === 'string') {
                if (row === 'self')
                    selectedRowStart = '+0';
                else
                    selectedRowStart = row as UnitSelector;
            }
            else if (row !== undefined) {
                if (row.from < row.to) {
                    selectedRowStart = row.from;
                    selectedRowEnd = row.to;
                }
                else {
                    selectedRowStart = row.to;
                    selectedRowEnd = row.from;
                }
            }
            else {
                selectedRowStart = '$0';
            }

            return {
                type: 'selector',
                from: exp({
                    page: selectedPage,
                    start: {
                        col: `$${selectedColumn.index}`,
                        row: modifyUnitSelector(selectedRowStart, selectedColumn.grouped)
                    },
                    end: selectedRowEnd ? {
                        col: `$${selectedColumn.index}`,
                        row: modifyUnitSelector(selectedRowEnd, selectedColumn.grouped)
                    } : undefined
                })
            };
        }
    }
};

const exp = <T>(value: T): T => { console.log(inspect(value, { depth: null, colors: true })); return value; };

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


                //const behavior = resolveBehavior(column.type, types, numeric, temporal)

                const formula = column.expression ? resolveExpression(column.expression, page.name, group.name, column.name, resolved) : undefined;

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.header,
                    dataStyle: columnTheme.data,
                    formula,
                };

                resultGroup.columns.push(resultColumn);
            }
        }
    };

    return resultBook;
};