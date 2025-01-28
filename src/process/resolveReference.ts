import { TableBookProcessIssue } from "../issues";
import { TableReference } from "../tables/types";
import { ObjectPath, Result } from "../util";

export const isReference = (value: unknown): value is TableReference => typeof value === 'string' && value.startsWith('@');

export type MissingReferenceResolver<T> = (name: string, path: ObjectPath) => Result<T, TableBookProcessIssue[]>;

export class ReferenceResolver<T> {
    #refs: Record<string, T | TableReference>;
    #onMissing: MissingReferenceResolver<T>[];

    constructor(refs: Record<string, T | TableReference> | undefined, onMissing: (MissingReferenceResolver<T> | undefined)[] = []) {
        this.#refs = { ...(refs ?? {}) };
        this.#onMissing = onMissing.filter((fn): fn is MissingReferenceResolver<T> => fn !== undefined);
    }

    resolve(ref: TableReference, path: ObjectPath): Result<T, TableBookProcessIssue[]> {
        const visited = [ref];

        while (true) {
            const name = ref.substring(1);
            const result = this.#refs[name];

            if (result === undefined) {
                const issues: TableBookProcessIssue[] = [];

                for (const missing of this.#onMissing) {
                    const result = missing(name, path);

                    if (result.success) {
                        this.#refs[name] = result.value;
                        return result;
                    } else
                        issues.push(...result.info);
                }

                return Result.failure(issues.length ? issues : [{ type: 'processing', message: 'Missing reference', path, data: ref }]);

            }
            else if (isReference(result)) {
                if (visited.includes(result))
                    return Result.failure([{ type: 'processing', message: `Circular reference`, path, data: visited }]);

                visited.push(result);

                ref = result;
            }
            else
                return Result.failure([{ type: 'processing', message: 'Invalid reference', path, data: ref }]);
        }
    }
}