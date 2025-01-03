import { SheetGenerator } from "./sheets/SheetGenerator";
import { TableBook } from "./tables/types";


type ResolvedColumn = {
    sheet: string;
    group: boolean;
    index: number;
};

export const resolveColumns = (tablebook: TableBook): Map<string, ResolvedColumn> => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    for (let s = 0; s < tablebook.sheets.length; s++) {

        const sheet = tablebook.sheets[s];

        for (let g = 0; g < sheet.groups.length; g++) {
            const group = sheet.groups[g];

            for (let c = 0; c < group.columns.length; c++) {
                const column = group.columns[c];

                const fullname = sheet.groups.length > 1 ? `${sheet.name}.${group.name}.${column.name}` : `${sheet.name}.${column.name}`;

                if (resolved.has(fullname))
                    throw new Error(`Duplicate column name: ${fullname}`);

                resolved.set(fullname, { sheet: sheet.name, group: sheet.groups.length > 1, index: c });
            }
        }
    }

    return resolved;
};


export const process = (tablebook: TableBook, generator: SheetGenerator) => {
    const resolved = resolveColumns(tablebook);
};


