import { DateTime } from "luxon";
import { TableBookProcessIssue } from "../issues";
import { SheetBehavior, SheetConditionalStyle, SheetPosition, SheetRule } from "../sheets";
import { Color, ColumnType, ComparisonRule, EnumType, LookupType, NumericFormat, NumericType, Reference, Style, TemporalFormat, TemporalString, TemporalType, TextRule, TextType } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { isReference, resolveReference } from "./resolveReference";
import { resolveSelector } from "./resolveSelector";
import { resolveStyle } from "./resolveStyle";

const resolveNumericRule = (
    rule: NumericType['rule'] & {},
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
            value: (rule as ComparisonRule<number>).value
        });
    }
};

const resolveTemporalString = (value: TemporalString): DateTime => {
    return DateTime.fromISO(value);
};

const resolveTemporalRule = (
    rule: TemporalType['rule'] & {},
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
            value: resolveTemporalString((rule as ComparisonRule<TemporalString>).value)
        });
    }
};

const resolveTextBehavior = (
    resolved: TextType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: Record<string, Reference | Color>,
    styles: Record<string, Reference | Style>,
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
    type: EnumType,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
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

            const applyResult = resolveStyle(item.style, colors, styles, path);

            if (!applyResult.success)
                issues.push(...applyResult.info);
            else
                return {
                    rule: { type: 'is', value: item.name },
                    apply: applyResult.value
                };
        }).filter((value): value is SheetConditionalStyle => value !== undefined)
    };

    return issues.length === 0 ? Result.success(behavior) : Result.failure(issues, behavior);
};

const resolveLookupBehavior = (
    type: LookupType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    let result = resolveSelector({ column: type.values, row: 'all' }, columns, page, group, name, path);

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
    type: NumericType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    numeric: Record<string, Reference | NumericFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: NumericFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = resolveReference(type.format, numeric, v => typeof v === 'object', path);

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
    type: TemporalType,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    temporal: Record<string, Reference | TemporalFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    const issues: TableBookProcessIssue[] = [];

    let resolvedFormat: TemporalFormat | undefined;
    if (type.format) {
        if (isReference(type.format)) {
            const resolved = resolveReference(type.format, temporal, v => typeof v === 'object', path);

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
    type: ColumnType | Reference,
    page: string, group: string, name: string,
    columns: Map<string, ResolvedColumn>,
    types: Record<string, ColumnType | Reference>,
    colors: Record<string, Color | Reference>,
    styles: Record<string, Style | Reference>,
    numeric: Record<string, Reference | NumericFormat>,
    temporal: Record<string, Reference | TemporalFormat>,
    path: ObjectPath
): Result<SheetBehavior, TableBookProcessIssue[]> => {
    let resolved: ColumnType;

    if (isReference(type)) {
        const result = resolveReference(type, types, v => !isReference(v), path);

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
            return resolveNumericBehavior(resolved, page, group, name, columns, colors, styles, numeric, path);

        case "temporal":
            return resolveTemporalBehavior(resolved, page, group, name, columns, colors, styles, temporal, path);
    };

};
