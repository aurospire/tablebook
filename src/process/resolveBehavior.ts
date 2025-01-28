import { DateTime } from "luxon";
import { TableBookProcessIssue } from "../issues";
import { SheetBehavior, SheetConditionalStyle, SheetRule, SheetStyle } from "../sheets";
import { TableColor, TableColumnType, TableComparisonRule, TableEnumType, TableLookupType, TableNumericFormat, TableNumericType, TableReference, TableStyle, TableTemporalFormat, TableTemporalString, TableTemporalType, TableTextType } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { resolveColor } from "./resolveColor";
import { ResolvedColumn } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { ReferenceRegistry } from "./ReferenceRegistry";
import { resolveSelector } from "./resolveSelector";
import { resolveStyle } from "./resolveStyle";
import { isReference } from "../tables";

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

const resolveTemporalString = (value: TableTemporalString): DateTime => {
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

const resolveTextBehavior = (
    resolved: TableTextType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {

    let resolvedRule: SheetRule | undefined;

    const issues: TableBookProcessIssue[] = [];

    if (resolved.rule) {
        if (resolved.rule.type === 'custom') {
            const result = resolveExpression(resolved.rule.expression, page, group, name, columns, path);
            if (result.success)
                resolvedRule = {
                    type: 'formula',
                    expression: result.value
                };
            else
                issues.push(...result.info);
        }
        else {
            resolvedRule = {
                type: resolved.rule.type,
                value: resolved.rule.value
            };
        }
    }

    let resolvedStyles: SheetConditionalStyle[] | undefined;

    if (resolved.styles) {
        resolved.styles.map((style): SheetConditionalStyle | undefined => {
            const styleIssues: TableBookProcessIssue[] = [];

            let rule: SheetRule | undefined;

            if (style.rule.type === 'custom') {
                const result = resolveExpression(style.rule.expression, page, group, name, columns, path);
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
                    type: style.rule.type,
                    value: style.rule.value
                };
            }

            const applyResult = resolveStyle(style.apply, colors, styles, path);

            if (!applyResult.success)
                styleIssues.push(...applyResult.info);

            if (styleIssues.length > 0) {
                issues.push(...styleIssues);
            }
            else {
                return {
                    rule: rule!,
                    apply: applyResult.value!
                };
            }
        });
    }

    const behavior: SheetBehavior = {
        kind: 'text',
        rule: resolvedRule,
        styles: resolvedStyles
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

export const resolveEnumBehavior = (
    type: TableEnumType,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    const behavior: SheetBehavior = {
        kind: 'text',
        rule: {
            type: 'enum',
            values: type.items.map(value => typeof value === 'string' ? value : value.name)
        },
        styles: type.items.map((item): SheetConditionalStyle | undefined => {
            if (typeof item === 'string' || item.style === undefined)
                return undefined;

            // Resolve the style
            let style: SheetStyle | undefined = undefined;

            const styleResult = resolveStyle(item.style, colors, styles, path);
            const colorResult = item.color ? resolveColor(item.color, colors, path) : Result.success(undefined);

            if (styleResult.success)
                style = styleResult.value;
            else
                issues.push(...styleResult.info);

            if (colorResult.success) {
                // If a style already exists, change the forecolor to it
                if (style)
                    style.fore = colorResult.value;
                // Otherwise, create a new style
                else
                    style = { fore: colorResult.value };
            }
            else
                issues.push(...colorResult.info);

            if (style)
                return {
                    rule: { type: 'is', value: item.name },
                    apply: style
                };
        }).filter((value): value is SheetConditionalStyle => value !== undefined)
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveLookupBehavior = (
    type: TableLookupType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    let result = resolveSelector({ column: type.column, rows: 'all' }, columns, page, group, name, path);

    if (!result.success)
        return Result.failure(result.info);
    else
        return Result.success({
            kind: 'text',
            rule: {
                type: 'lookup',
                values: result.value
            }
        });
};

const resolveNumericBehavior = (
    type: TableNumericType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    numerics: ReferenceRegistry<TableNumericFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: TableNumericFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = numerics.resolve(type.format, path);

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

            const ruleResult = resolveNumericRule(style.rule, page, group, name, columns, path);

            if (!ruleResult.success)
                styleIssues.push(...ruleResult.info);

            const applyResult = resolveStyle(style.apply, colors, styles, path);

            if (!applyResult.success)
                styleIssues.push(...applyResult.info);

            if (styleIssues.length > 0) {
                issues.push(...styleIssues);
            }
            else {
                return {
                    rule: ruleResult.value!,
                    apply: applyResult.value!
                };
            }
        }).filter((value): value is SheetConditionalStyle => value !== undefined);
    }

    const behavior: SheetBehavior = {
        kind: 'number',
        format: resolvedFormat,
        rule: resolvedRule,
        styles: resolvedStyles
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};


const resolveTemporalBehavior = (
    type: TableTemporalType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    temporals: ReferenceRegistry<TableTemporalFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: TableTemporalFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = temporals.resolve(type.format, path);

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

            const ruleResult = resolveTemporalRule(style.rule, page, group, name, columns, path);

            if (!ruleResult.success)
                styleIssues.push(...ruleResult.info);

            const applyResult = resolveStyle(style.apply, colors, styles, path);

            if (!applyResult.success)
                styleIssues.push(...applyResult.info);

            if (styleIssues.length > 0) {
                issues.push(...styleIssues);
            }
            else {
                return {
                    rule: ruleResult.value!,
                    apply: applyResult.value!
                };
            }
        }).filter((value): value is SheetConditionalStyle => value !== undefined);
    }

    const behavior: SheetBehavior = {
        kind: 'number',
        format: resolvedFormat,
        rule: resolvedRule,
        styles: resolvedStyles
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

export const resolveBehavior = (
    type: TableColumnType | TableReference,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    types: ReferenceRegistry<TableColumnType>,
    colors: ReferenceRegistry<TableColor>,
    styles: ReferenceRegistry<TableStyle>,
    numerics: ReferenceRegistry<TableNumericFormat>,
    temporals: ReferenceRegistry<TableTemporalFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    let resolved: TableColumnType;

    if (isReference(type)) {
        const result = types.resolve(type, path);

        if (result.success)
            resolved = result.value;
        else
            return Result.failure(result.info);
    }
    else
        resolved = type;

    switch (resolved.kind) {
        case "text":
            return resolveTextBehavior(resolved, page, group, name, columns, colors, styles, path);

        case "enum":
            return resolveEnumBehavior(resolved, colors, styles, path);

        case "lookup":
            return resolveLookupBehavior(resolved, page, group, name, columns, path);

        case "numeric":
            return resolveNumericBehavior(resolved, page, group, name, columns, colors, styles, numerics, path);

        case "temporal":
            return resolveTemporalBehavior(resolved, page, group, name, columns, colors, styles, temporals, path);
    };

};
