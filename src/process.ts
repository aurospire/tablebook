import { DateTime } from "luxon";
import { SheetBehavior } from "./sheets/SheetBehavior";
import { SheetBook, SheetColumn, SheetGroup, SheetPage } from "./sheets/SheetBook";
import { SheetSelector } from "./sheets/SheetSelector";
import { SheetConditionalStyle, SheetRule } from "./sheets/SheetRule";
import { SheetBorder, SheetStyle, SheetTitleStyle } from "./sheets/SheetStyle";
import { standardColors, standardThemes } from "./tables/palettes";
import { Color, ColumnType, ComparisonRule, DataSelector, Expression, HeaderStyle, NumericFormat, NumericType, Reference, Style, TableBook, TemporalFormat, TemporalString, TemporalType, Theme, UnitSelector } from "./tables/types";
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
    const italic: boolean | undefined = style.italic;

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

    return `${selector[0]}${value + (grouped ? 2 : 1)}`;
};

const resolveSelector = (selector: DataSelector, columns: Map<string, ResolvedColumn>, page: string, group: string, name: string): SheetSelector => {
    const { column, row } = selector === 'self' ? { column: 'self', row: 'self' } : selector;

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

    let selectedRowStart: UnitSelector;
    let selectedRowEnd: UnitSelector | true | undefined;

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
        selectedRowEnd = true;
    }

    return {
        page: selectedPage,
        from: {
            col: `$${selectedColumn.index}`,
            row: modifyUnitSelector(selectedRowStart, selectedColumn.grouped)
        },
        to: selectedRowEnd ? {
            col: `$${selectedColumn.index}`,
            row: selectedRowEnd === true ? undefined : modifyUnitSelector(selectedRowEnd, selectedColumn.grouped)
        } : undefined
    };

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
            return {
                type: 'selector',
                from: resolveSelector(expression.from, columns, page, group, name)
            };
        }
    }
};


const resolveNumericRule = (rule: NumericType['rule'] & {}, page: string, group: string, name: string, columns: Map<string, ResolvedColumn>): SheetRule => {
    if (rule.type === 'custom') {
        return {
            type: 'formula',
            expression: resolveExpression(rule.expression, page, group, name, columns)
        };
    }
    else if (rule.type === 'between' || rule.type === 'outside') {
        return {
            type: rule.type,
            target: 'number',
            low: rule.low,
            high: rule.high
        };
    }
    // WHY ISNT THIS RESOLVING AS A COMPARISON RULE
    else {
        return {
            type: rule.type,
            target: 'number',
            value: (rule as ComparisonRule<number>).value
        };
    }
};

const resolveTemporalString = (value: TemporalString): DateTime => {
    return DateTime.fromISO(value);
};

const resolveTemporalRule = (rule: TemporalType['rule'] & {}, page: string, group: string, name: string, columns: Map<string, ResolvedColumn>): SheetRule => {
    if (rule.type === 'custom') {
        return {
            type: 'formula',
            expression: resolveExpression(rule.expression, page, group, name, columns)
        };
    }
    else if (rule.type === 'between' || rule.type === 'outside') {
        return {
            type: rule.type,
            target: 'temporal',
            low: resolveTemporalString(rule.low),
            high: resolveTemporalString(rule.high)
        };
    }
    // WHY ISNT THIS RESOLVING AS A COMPARISON RULE
    else {
        return {
            type: rule.type,
            target: 'temporal',
            value: resolveTemporalString((rule as ComparisonRule<TemporalString>).value)
        };
    }
};


const resolveBehavior = (
    type: ColumnType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    numeric: Record<string, Reference | NumericFormat>,
    temporal: Record<string, Reference | TemporalFormat>,
): SheetBehavior => {

    switch (type.kind) {
        case "text":
            return {
                kind: 'text',
                rule: type.rule ? type.rule.type === 'custom' ? {
                    type: 'formula',
                    expression: resolveExpression(type.rule.expression, page, group, name, columns)
                } : {
                    type: type.rule.type,
                    value: type.rule.value
                } : undefined,
                styles: type.styles ? type.styles.map((style): SheetConditionalStyle => ({
                    rule: style.rule.type === 'custom' ? {
                        type: 'formula',
                        expression: resolveExpression(style.rule.expression, page, group, name, columns)
                    } : {
                        type: style.rule.type,
                        value: style.rule.value
                    },
                    apply: resolveStyle(style.apply, colors, styles)
                })) : undefined
            };
        case "enum":
            return {
                kind: 'text',
                rule: {
                    type: 'enum',
                    values: type.items.map(value => typeof value === 'string' ? value : value.name)
                },
                styles: type.items.map((value): SheetConditionalStyle | undefined => {
                    return typeof value === 'string' || value.style === undefined ? undefined :
                        {
                            rule: {
                                type: 'is',
                                value: value.name
                            },
                            apply: resolveStyle(value.style, colors, styles)
                        };
                }).filter((value): value is SheetConditionalStyle => value !== undefined)
            };
        case "lookup":
            return {
                kind: 'text',
                rule: {
                    type: 'lookup',
                    values: resolveSelector({ column: type.values }, columns, page, group, name)
                }
            };

        case "numeric":
            return {
                kind: 'number',
                format: type.format ? isReference(type.format) ? resolveReference(type.format, numeric, v => typeof v === 'object') : type.format : undefined,
                rule: type.rule ? resolveNumericRule(type.rule, page, group, name, columns) : undefined,
                styles: type.styles ? type.styles.map((style): SheetConditionalStyle => ({
                    rule: resolveNumericRule(style.rule, page, group, name, columns),
                    apply: resolveStyle(style.apply, colors, styles)
                })) : undefined
            };
        case "temporal":
            return {
                kind: 'temporal',
                format: type.format ? isReference(type.format) ? resolveReference(type.format, temporal, v => typeof v === 'object') : type.format : undefined,
                rule: type.rule ? resolveTemporalRule(type.rule, page, group, name, columns) : undefined,
                styles: type.styles ? type.styles.map((style): SheetConditionalStyle => ({
                    rule: resolveTemporalRule(style.rule, page, group, name, columns),
                    apply: resolveStyle(style.apply, colors, styles)
                })) : undefined
            };
    };

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

                const formula = column.expression ? resolveExpression(column.expression, page.name, group.name, column.name, resolved) : undefined;

                const type = isReference(column.type) ? resolveReference(column.type, types, v => !isReference(v)) : column.type;

                const behavior = resolveBehavior(type, page.name, group.name, column.name, resolved, colors, styles, numeric, temporal);

                const resultColumn: SheetColumn = {
                    title: column.name,
                    titleStyle: columnTheme.header,
                    dataStyle: columnTheme.data,
                    formula,
                    behavior
                };

                resultGroup.columns.push(resultColumn);
            }
        }
    };

    return resultBook;
};
