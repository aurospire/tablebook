import { TableBookProcessIssue } from "../issues";
import { isReference, TableReferenceResolver } from "../tables/references";
import { TableReference } from "../tables/types";
import { ObjectPath, Result } from "../util";

export class ReferenceRegistry<T> {
    #refs: Record<string, T | TableReference>;
    #onMissing: TableReferenceResolver<T>[];

    constructor(refs: Record<string, T | TableReference> | undefined, onMissing: (TableReferenceResolver<T> | undefined)[] = []) {
        this.#refs = { ...(refs ?? {}) };
        this.#onMissing = onMissing.filter((fn): fn is TableReferenceResolver<T> => fn !== undefined);
    }

    resolve(ref: TableReference, path: ObjectPath): Result<T, TableBookProcessIssue[]> {
        const visited = [ref];

        while (true) {
            const name = ref.substring(1);
            const result = this.#refs[name];

            if (result === undefined) {
                const issues: TableBookProcessIssue[] = [];

                for (const missing of this.#onMissing) {
                    const result = missing(name);

                    if (result.success) {
                        this.#refs[name] = result.value;
                        return result;
                    } else
                        issues.push({ type: 'processing', message: result.info, path, data: ref });
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
