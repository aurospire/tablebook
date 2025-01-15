import { TableBookResult, TableBookProcessIssue } from "../issues";
import { TableBook } from "../tables/types";

export type ResolvedColumn = {
    page: string;
    grouped: boolean;
    index: number;
};

export const toLookupName = (page: string, group: string, name: string) => `${page}.${group}.${name}`;

export const resolveColumns = (tablebook: TableBook): TableBookResult<Map<string, ResolvedColumn>, TableBookProcessIssue> => {
    const issues: TableBookProcessIssue[] = [];

    const resolved: Map<string, ResolvedColumn> = new Map();

    const pages = new Set<string>();

    for (let s = 0; s < tablebook.pages.length; s++) {

        const page = tablebook.pages[s];

        if (pages.has(page.name))
            issues.push({ type: 'processing', message: `Duplicate page name: ${page.name}`, path: ['pages', s], data: page });

        pages.add(page.name);

        const groups = new Set<string>();
        let index = 0;

        for (let g = 0; g < page.groups.length; g++) {
            const group = page.groups[g];

            if (groups.has(group.name))
                issues.push({ type: 'processing', message: `Duplicate group name: ${group.name}`, path: ['pages', s, 'groups', g], data: group });

            for (let c = 0; c < group.columns.length; c++) {
                const column = group.columns[c];

                const fullname = toLookupName(page.name, group.name, column.name);

                if (resolved.has(fullname))
                    issues.push({ type: 'processing', message: `Duplicate column name: ${group.name}`, path: ['pages', s, 'groups', g, 'columns', c], data: column });

                resolved.set(fullname, { page: page.name, grouped: page.groups.length > 1, index: index++ });
            }
        }
    }

    return issues.length ? { success: false, issues, data: resolved } : { success: true, data: resolved };
};
