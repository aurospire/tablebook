import { TableBookPath, TableBookProcessIssue, TableBookResult } from "../issues";
import { Reference } from "../tables/types";

export const isReference = (value: unknown): value is Reference => typeof value === 'string' && value.startsWith('@');

export const resolveReference = <T>(
    ref: Reference,
    map: Record<string, T | Reference>,
    is: (value: unknown) => boolean,
    path: TableBookPath
): TableBookResult<T, TableBookProcessIssue> => {
    const visited = [ref];

    const checker = is as (value: unknown) => value is T;

    while (true) {
        const result = map[ref.substring(1)];

        if (result === undefined)
            return { success: false, issues: [{ type: 'processing', message: 'Missing reference', path, data: ref }] };
        else if (checker(result))
            return { success: true, data: result as T };
        else if (isReference(result)) {
            if (visited.includes(result))
                return { success: false, issues: [{ type: 'processing', message: `Circular reference`, path, data: visited }] };

            visited.push(result);

            ref = result;
        }
        else
            return { success: false, issues: [{ type: 'processing', message: 'Invalid reference', path, data: ref }] };
    }
};
