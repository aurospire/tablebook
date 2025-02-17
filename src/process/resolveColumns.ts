import { TableBookProcessIssue } from "../issues";
import { TableBook } from "../tables/types";
import { Result } from "../util";

export type ResolvedColumn = {
    page: string;
    grouped: boolean;
    index: number;
};

export type ResolvedColumnMap = Map<string, ResolvedColumn>;

export const toLookupName = (page: string, group: string | undefined, name: string) => group ? `${page}.${group}.${name}` : `${page}.${name}`;

export const resolveColumns = (tablebook: TableBook, issues: TableBookProcessIssue[]): ResolvedColumnMap => {
    const resolved: ResolvedColumnMap = new Map();

    const pages = new Set<string>();

    for (let s = 0; s < tablebook.pages.length; s++) {

        const page = tablebook.pages[s];

        if (pages.has(page.name))
            issues.push({ type: 'processing', message: `Duplicate page name`, path: ['pages', s], data: page });

        pages.add(page.name);

        const schema = page.schema;

        if (Array.isArray(schema)) {
            const groups = new Set<string>();
            let index = 0;

            for (let g = 0; g < schema.length; g++) {
                const group = schema[g];

                if (groups.has(group.name))
                    issues.push({ type: 'processing', message: `Duplicate group name`, path: ['pages', s, 'schema', g], data: group });

                for (let c = 0; c < group.columns.length; c++) {
                    const column = group.columns[c];

                    const fullname = toLookupName(page.name, group.name, column.name);

                    if (resolved.has(fullname))
                        issues.push({ type: 'processing', message: `Duplicate column name`, path: ['pages', s, 'schema', g, 'columns', c], data: column });

                    resolved.set(fullname, { page: page.name, grouped: true, index: index++ });
                }
            }
        }
        else {
            let index = 0;
            for (let c = 0; c < schema.columns.length; c++) {
                const column = schema.columns[c];

                const fullname = toLookupName(page.name, undefined, column.name);

                if (resolved.has(fullname))
                    issues.push({ type: 'processing', message: `Duplicate column name`, path: ['pages', s, 'schema', 'columns', c], data: column });

                resolved.set(fullname, { page: page.name, grouped: false, index: index++ });
            }
        }
    };

    return resolved;
};
