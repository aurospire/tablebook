import { TableBookProcessIssue } from "../issues";
import { Reference } from "../tables/types";
import { ObjectPath, Result } from "../util";

export const isReference = (value: unknown): value is Reference => typeof value === 'string' && value.startsWith('@');

export const resolveReference = <T>(
    ref: Reference,
    map: Record<string, T | Reference>,
    is: (value: unknown) => boolean,
    path: ObjectPath
): Result<T, TableBookProcessIssue[]> => {
    const visited = [ref];

    const checker = is as (value: unknown) => value is T;

    while (true) {
        const result = map[ref.substring(1)];

        if (result === undefined)
            return Result.failure([{ type: 'processing', message: 'Missing reference', path, data: ref }]);
        else if (checker(result))
            return Result.success(result as T);
        else if (isReference(result)) {
            if (visited.includes(result))
                return Result.failure([{ type: 'processing', message: `Circular reference`, path, data: visited }]);

            visited.push(result);

            ref = result;
        }
        else
            return Result.failure([{ type: 'processing', message: 'Invalid reference', path, data: ref }]);
    }
};
