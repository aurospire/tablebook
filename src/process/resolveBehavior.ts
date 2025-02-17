import { DateTime } from "luxon";
import { TableBookProcessIssue } from "../issues";
import { SheetBehavior, SheetConditionalStyle, SheetRule, SheetStyle } from "../sheets";
import { isReference } from "../tables";
import { TableColor, TableComparisonRule, TableDataType, TableEnumType, TableLookupType, TableNumericFormat, TableNumericType, TableReference, TableStyle, TableTemporalFormat, TableTemporalString, TableTemporalType, TableTextType } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { TableDefinitionsManager } from "./DefinitionsRegistry";
import { resolveColor } from "./resolveColor";
import { ResolvedColumn } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { resolveSelector } from "./resolveSelector";
import { resolveStyle } from "./resolveStyle";


const resolveStyleAndColor = (
    style: TableStyle | TableReference | undefined,
    color: TableColor | TableReference | undefined,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetStyle | undefined => {

    let sheetStyle: SheetStyle | undefined;

    const styleResult = style ? resolveStyle(style, definitions, path) : Result.success(undefined);

    const colorResult = color ? resolveColor(color, definitions, path) : Result.success(undefined);

    if (styleResult.success)
        sheetStyle = styleResult.value;
    else
        issues.push(...styleResult.info);

    if (colorResult.success) {
        sheetStyle = sheetStyle ?? {};
        sheetStyle.fore = colorResult.value;
    }
    else
        issues.push(...colorResult.info);

    return sheetStyle;
};



const resolveTextRule = (
    rule: TableTextType['rule'] & {},
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetRule | undefined => {
    // Custom Rule
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, pageName, groupName, columnName, columns, path, issues);

        return result ? { type: 'formula', expression: result } : undefined;

    }
    // Text Comparison Rule
    else {
        return { type: rule.type, value: rule.value };
    }
};

const resolveNumericRule = (
    rule: TableNumericType['rule'] & {},
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetRule | undefined => {
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, pageName, groupName, columnName, columns, path, issues);

        return result ? { type: 'formula', expression: result } : undefined;
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
            value: (rule as TableComparisonRule<number>).value
        };
    }
};

const resolveTemporalString = (
    value: TableTemporalString
): DateTime => {
    return DateTime.fromISO(value);
};

const resolveTemporalRule = (
    rule: TableTemporalType['rule'] & {},
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetRule | undefined => {
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, pageName, groupName, columnName, columns, path, issues);

        return result ? { type: 'formula', expression: result } : undefined;
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
            value: resolveTemporalString((rule as TableComparisonRule<TableTemporalString>).value)
        };
    }
};


const resolveTextConditionalStyle = (
    styles: TableTextType['styles'] & {},
    pageName: string, groupName: string | undefined, columnName: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetConditionalStyle[] | undefined => {

    const result = styles.map((style): SheetConditionalStyle | undefined => {

        let rule: SheetRule | undefined;

        if (style.when.type === 'custom') {
            const result = resolveExpression(style.when.expression, pageName, groupName, columnName, columns, path, issues);

            rule = result ? { type: 'formula', expression: result } : undefined;
        }
        else {
            rule = { type: style.when.type, value: style.when.value };
        }

        const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path, issues);

        return styleResult ? { when: rule!, style: styleResult } : undefined;

    }).filter((value): value is SheetConditionalStyle => value !== undefined);

    return result.length > 0 ? result : undefined;
};


const resolveTextBehavior = (
    type: TableTextType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    let resolvedRule = type.rule ? resolveTextRule(type.rule, page, group, name, columns, path, issues) : undefined;

    let resolvedStyles = type.styles
        ? resolveTextConditionalStyle(type.styles, page, group, name, columns, definitions, path, issues)
        : undefined;

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: resolvedStyles,
        rule: resolvedRule,
    };

    return behavior;
};

const resolveLookupBehavior = (
    type: TableLookupType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    const selector = resolveSelector({ column: type.column, rows: 'all' }, columns, page, group, name, path, issues);

    if (!selector) return undefined;

    const resolvedStyles = type.styles
        ? resolveTextConditionalStyle(type.styles, page, group, name, columns, definitions, path, issues)
        : undefined;

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: resolvedStyles,
        rule: {
            type: 'lookup',
            values: selector
        }
    };

    return behavior;
};

const resolveEnumBehavior = (
    type: TableEnumType,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: type.items.map((item): SheetConditionalStyle | undefined => {
            if (typeof item === 'string' || (item.style === undefined && item.color === undefined))
                return undefined;

            const styleResult = resolveStyleAndColor(item.style, item.color, definitions, path, issues);

            return {
                when: { type: 'is', value: item.name },
                style: styleResult ?? {}
            };

        }).filter((value): value is SheetConditionalStyle => value !== undefined),
        rule: {
            type: 'enum',
            values: type.items.map(value => typeof value === 'string' ? value : value.name)
        }
    };

    return behavior;
};

const resolveNumericBehavior = (
    type: TableNumericType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    const resolvedFormat: TableNumericFormat | undefined = type.format
        ? isReference(type.format)
            ? Result.unwrap(definitions.numerics.resolve(type.format, path), (info): undefined => { issues.push(...info); })
            : type.format
        : undefined;

    const resolvedRule = type.rule ? resolveNumericRule(type.rule, page, group, name, columns, path, issues) : undefined;

    const resolvedStyles = type.styles
        ? type.styles.map((style): SheetConditionalStyle | undefined => {
            const ruleResult = resolveNumericRule(style.when, page, group, name, columns, path, issues);

            const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path, issues);

            if (styleResult && ruleResult)
                return { when: ruleResult, style: styleResult };

        }).filter((value): value is SheetConditionalStyle => value !== undefined)
        : undefined;


    const behavior: SheetBehavior = {
        kind: 'number',
        rule: resolvedRule,
        styles: resolvedStyles,
        format: resolvedFormat,
    };

    return behavior;
};

const resolveTemporalBehavior = (
    type: TableTemporalType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    const resolvedFormat: TableTemporalFormat | undefined = type.format
        ? isReference(type.format)
            ? Result.unwrap(definitions.temporals.resolve(type.format, path), (info): undefined => { issues.push(...info); })
            : type.format
        : undefined;


    const resolvedRule: SheetRule | undefined = type.rule
        ? resolveTemporalRule(type.rule, page, group, name, columns, path, issues)
        : undefined;

    const resolvedStyles = type.styles
        ? type.styles.map((style): SheetConditionalStyle | undefined => {
            const ruleResult = resolveTemporalRule(style.when, page, group, name, columns, path, issues);

            const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path, issues);

            if (styleResult && ruleResult)
                return { when: ruleResult, style: styleResult };

        }).filter((value): value is SheetConditionalStyle => value !== undefined)
        :undefined;
        
    const behavior: SheetBehavior = {
        kind: 'number',
        styles: resolvedStyles,
        rule: resolvedRule,
        format: resolvedFormat,
    };

    return behavior;
};


export const resolveBehavior = (
    type: TableDataType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath,
    issues: TableBookProcessIssue[]
): SheetBehavior | undefined => {

    switch (type.kind) {
        case "text":
            return resolveTextBehavior(type, page, group, name, columns, definitions, path, issues);

        case "enum":
            return resolveEnumBehavior(type, definitions, path, issues);

        case "lookup":
            return resolveLookupBehavior(type, page, group, name, columns, definitions, path, issues);

        case "numeric":
            return resolveNumericBehavior(type, page, group, name, columns, definitions, path, issues);

        case "temporal":
            return resolveTemporalBehavior(type, page, group, name, columns, definitions, path, issues);
    };

};
