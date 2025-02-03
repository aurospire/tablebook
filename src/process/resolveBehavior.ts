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
    path: ObjectPath
): Result<SheetStyle | undefined, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

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

    return issues.length === 0 ? Result.success(sheetStyle) : Result.failure(issues, sheetStyle);
};



const resolveTextRule = (
    rule: TableTextType['rule'] & {},
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
): Result<SheetRule, TableBookProcessIssue[]> => {
    // Custom Rule
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, page, group, name, columns, path);
        if (result.success)
            return Result.success({
                type: 'formula',
                expression: result.value
            });
        else
            return Result.failure(result.info);
    }
    // Text Comparison Rule
    else {
        return Result.success({
            type: rule.type,
            value: rule.value
        });
    }
};

const resolveNumericRule = (
    rule: TableNumericType['rule'] & {},
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath,
): Result<SheetRule, TableBookProcessIssue[]> => {
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, page, group, name, columns, path);

        if (!result.success)
            return Result.failure(result.info);

        return Result.success({
            type: 'formula',
            expression: result.value
        });
    }
    else if (rule.type === 'between' || rule.type === 'outside') {
        return Result.success({
            type: rule.type,
            target: 'number',
            low: rule.low,
            high: rule.high
        });
    }
    // WHY ISNT THIS RESOLVING AS A COMPARISON RULE
    else {
        return Result.success({
            type: rule.type,
            target: 'number',
            value: (rule as TableComparisonRule<number>).value
        });
    }
};

const resolveTemporalString = (
    value: TableTemporalString
): DateTime => {
    return DateTime.fromISO(value);
};

const resolveTemporalRule = (
    rule: TableTemporalType['rule'] & {},
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<SheetRule, TableBookProcessIssue[]> => {
    if (rule.type === 'custom') {
        const result = resolveExpression(rule.expression, page, group, name, columns, path);

        if (!result.success)
            return Result.failure(result.info);

        return Result.success({
            type: 'formula',
            expression: result.value
        });
    }
    else if (rule.type === 'between' || rule.type === 'outside') {
        return Result.success({
            type: rule.type,
            target: 'temporal',
            low: resolveTemporalString(rule.low),
            high: resolveTemporalString(rule.high)
        });
    }
    // WHY ISNT THIS RESOLVING AS A COMPARISON RULE
    else {
        return Result.success({
            type: rule.type,
            target: 'temporal',
            value: resolveTemporalString((rule as TableComparisonRule<TableTemporalString>).value)
        });
    }
};


const resolveTextConditionalStyle = (
    styles: TableTextType['styles'] & {},
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetConditionalStyle[] | undefined, TableBookProcessIssue[]> => {

    const issues: TableBookProcessIssue[] = [];

    const result = styles.map((style): SheetConditionalStyle | undefined => {
        const styleIssues: TableBookProcessIssue[] = [];

        let rule: SheetRule | undefined;

        if (style.when.type === 'custom') {
            const result = resolveExpression(style.when.expression, page, group, name, columns, path);
            if (result.success)
                rule = {
                    type: 'formula',
                    expression: result.value
                };
            else
                styleIssues.push(...result.info);
        }
        else {
            rule = {
                type: style.when.type,
                value: style.when.value
            };
        }

        const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path);

        if (!styleResult.success)
            styleIssues.push(...styleResult.info);

        if (styleIssues.length > 0) {
            issues.push(...styleIssues);
        }
        else {
            return {
                when: rule!,
                style: styleResult.value!
            };
        }
    }).filter((value): value is SheetConditionalStyle => value !== undefined);

    return issues.length === 0 ? Result.success(result) : Result.failure(issues, result);
};


const resolveTextBehavior = (
    type: TableTextType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedRule: SheetRule | undefined;
    if (type.rule) {
        const result = resolveTextRule(type.rule, page, group, name, columns, path);

        if (result.success)
            resolvedRule = result.value;
        else
            issues.push(...result.info);
    }

    let resolvedStyles: SheetConditionalStyle[] | undefined;
    if (type.styles) {
        const styleResult = resolveTextConditionalStyle(type.styles, page, group, name, columns, definitions, path);

        if (styleResult.success)
            resolvedStyles = styleResult.value;
        else
            issues.push(...styleResult.info);
    }

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: resolvedStyles,
        rule: resolvedRule,
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveLookupBehavior = (
    type: TableLookupType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let result = resolveSelector({ column: type.column, rows: 'all' }, columns, page, group, name, path);

    if (!result.success)
        issues.push(...result.info);

    let resolvedStyles: SheetConditionalStyle[] | undefined;
    if (type.styles) {
        const styleResult = resolveTextConditionalStyle(type.styles, page, group, name, columns, definitions, path);

        if (styleResult.success)
            resolvedStyles = styleResult.value;
        else
            issues.push(...styleResult.info);
    }

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: resolvedStyles,
        rule: {
            type: 'lookup',
            values: result.value!
        },
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveEnumBehavior = (
    type: TableEnumType,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    const behavior: SheetBehavior = {
        kind: 'text',
        styles: type.items.map((item): SheetConditionalStyle | undefined => {
            if (typeof item === 'string' || (item.style === undefined && item.color === undefined))
                return undefined;

            const styleResult = resolveStyleAndColor(item.style, item.color, definitions, path);

            if (!styleResult.success)
                issues.push(...styleResult.info);

            return {
                when: { type: 'is', value: item.name },
                style: styleResult.success ? styleResult.value ?? {} : {}
            };

        }).filter((value): value is SheetConditionalStyle => value !== undefined),
        rule: {
            type: 'enum',
            values: type.items.map(value => typeof value === 'string' ? value : value.name)
        }
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveNumericBehavior = (
    type: TableNumericType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: TableNumericFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = definitions.numerics.resolve(type.format, path);

            if (resolved.success)
                resolvedFormat = resolved.value;
            else
                issues.push(...resolved.info);
        }
        else
            resolvedFormat = type.format;
    }

    let resolvedRule: SheetRule | undefined;
    if (type.rule) {
        const result = resolveNumericRule(type.rule, page, group, name, columns, path);

        if (result.success)
            resolvedRule = result.value;
        else
            issues.push(...result.info);
    }

    let resolvedStyles: SheetConditionalStyle[] | undefined;
    if (type.styles) {
        resolvedStyles = type.styles.map((style): SheetConditionalStyle | undefined => {
            const styleIssues: TableBookProcessIssue[] = [];

            const ruleResult = resolveNumericRule(style.when, page, group, name, columns, path);

            if (!ruleResult.success)
                styleIssues.push(...ruleResult.info);

            const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path);

            if (!styleResult.success)
                styleIssues.push(...styleResult.info);

            if (styleIssues.length > 0) {
                issues.push(...styleIssues);
            }
            else {
                return {
                    when: ruleResult.value!,
                    style: styleResult.value!
                };
            }
        }).filter((value): value is SheetConditionalStyle => value !== undefined);
    }

    const behavior: SheetBehavior = {
        kind: 'number',
        rule: resolvedRule,
        styles: resolvedStyles,
        format: resolvedFormat,
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveTemporalBehavior = (
    type: TableTemporalType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: TableTemporalFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = definitions.temporals.resolve(type.format, path);

            if (resolved.success)
                resolvedFormat = resolved.value;
            else
                issues.push(...resolved.info);
        }
        else
            resolvedFormat = type.format;
    }

    let resolvedRule: SheetRule | undefined;
    if (type.rule) {
        const result = resolveTemporalRule(type.rule, page, group, name, columns, path);

        if (result.success)
            resolvedRule = result.value;
        else
            issues.push(...result.info);
    }

    let resolvedStyles: SheetConditionalStyle[] | undefined;
    if (type.styles) {
        resolvedStyles = type.styles.map((style): SheetConditionalStyle | undefined => {
            const styleIssues: TableBookProcessIssue[] = [];

            const ruleResult = resolveTemporalRule(style.when, page, group, name, columns, path);

            if (!ruleResult.success)
                styleIssues.push(...ruleResult.info);

            const styleResult = resolveStyleAndColor(style.style, style.color, definitions, path);

            if (!styleResult.success)
                styleIssues.push(...styleResult.info);

            if (styleIssues.length > 0) {
                issues.push(...styleIssues);
            }
            else {
                return {
                    when: ruleResult.value!,
                    style: styleResult.value!
                };
            }
        }).filter((value): value is SheetConditionalStyle => value !== undefined);
    }

    const behavior: SheetBehavior = {
        kind: 'number',
        styles: resolvedStyles,
        rule: resolvedRule,
        format: resolvedFormat,
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};


export const resolveBehavior = (
    type: TableDataType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    definitions: TableDefinitionsManager,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {

    switch (type.kind) {
        case "text":
            return resolveTextBehavior(type, page, group, name, columns, definitions, path);

        case "enum":
            return resolveEnumBehavior(type, definitions, path);

        case "lookup":
            return resolveLookupBehavior(type, page, group, name, columns, definitions, path);

        case "numeric":
            return resolveNumericBehavior(type, page, group, name, columns, definitions, path);

        case "temporal":
            return resolveTemporalBehavior(type, page, group, name, columns, definitions, path);
    };

};
