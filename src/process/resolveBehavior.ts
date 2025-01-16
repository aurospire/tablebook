import { DateTime } from "luxon";
import { TableBookProcessIssue } from "../issues";
import { SheetBehavior, SheetConditionalStyle, SheetRule } from "../sheets";
import { Color, ColumnType, ComparisonRule, NumericFormat, NumericType, Reference, Style, TemporalFormat, TemporalString, TemporalType } from "../tables/types";
import { ObjectPath, Result } from "../util";
import { ResolvedColumn } from "./resolveColumns";
import { resolveExpression } from "./resolveExpression";
import { isReference, resolveReference } from "./resolveReference";
import { resolveSelector } from "./resolveSelector";
import { resolveStyle } from "./resolveStyle";

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
            return {
                kind: 'text',
                rule: resolved.rule ? resolved.rule.type === 'custom' ? {
                    type: 'formula',
                    expression: resolveExpression(resolved.rule.expression, page, group, name, columns)
                } : {
                    type: resolved.rule.type,
                    value: resolved.rule.value
                } : undefined,
                styles: resolved.styles ? resolved.styles.map((style): SheetConditionalStyle => ({
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
                    values: resolved.items.map(value => typeof value === 'string' ? value : value.name)
                },
                styles: resolved.items.map((value): SheetConditionalStyle | undefined => {
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
                    values: resolveSelector({ column: resolved.values }, columns, page, group, name)
                }
            };

        case "numeric":
            return {
                kind: 'number',
                format: resolved.format ? isReference(resolved.format) ? resolveReference(resolved.format, numeric, v => typeof v === 'object') : resolved.format : undefined,
                rule: resolved.rule ? resolveNumericRule(resolved.rule, page, group, name, columns) : undefined,
                styles: resolved.styles ? resolved.styles.map((style): SheetConditionalStyle => ({
                    rule: resolveNumericRule(style.rule, page, group, name, columns),
                    apply: resolveStyle(style.apply, colors, styles)
                })) : undefined
            };
        case "temporal":
            return {
                kind: 'temporal',
                format: resolved.format ? isReference(resolved.format) ? resolveReference(resolved.format, temporal, v => typeof v === 'object') : resolved.format : undefined,
                rule: resolved.rule ? resolveTemporalRule(resolved.rule, page, group, name, columns) : undefined,
                styles: resolved.styles ? resolved.styles.map((style): SheetConditionalStyle => ({
                    rule: resolveTemporalRule(style.rule, page, group, name, columns),
                    apply: resolveStyle(style.apply, colors, styles)
                })) : undefined
            };
    };

};
