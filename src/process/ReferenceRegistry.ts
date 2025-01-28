import { TableBookProcessIssue } from "../issues";
import { isReference, TableReferenceResolver } from "../tables/references";
import { TableReference } from "../tables/types";
import { ObjectPath, Result } from "../util";

export class ReferenceRegistry<T> {
    #refs: Record<string, T | TableReference>;
    #resolvers: TableReferenceResolver<T>[];

    constructor(refs: Record<string, T | TableReference> | undefined, resolvers: (TableReferenceResolver<T> | undefined)[] = []) {
        this.#refs = { ...(refs ?? {}) };
        this.#resolvers = resolvers.filter((fn): fn is TableReferenceResolver<T> => fn !== undefined);
    }

    resolve(ref: TableReference, path: ObjectPath): Result<T, TableBookProcessIssue[]> {
        const visited = [ref];

        while (true) {
            const name = ref.substring(1);

            const result = this.#refs[name];

            if (result === undefined) {
                const issues: TableBookProcessIssue[] = [];

                for (const resolver of this.#resolvers) {
                    const result = resolver(name);

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
                return Result.success(result);
        }
    }
}
