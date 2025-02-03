import { TableBookProcessIssue } from "../issues";
import { isReference, TableDefinitionResolver, TableReferenceLookup, TableReferenceResolver } from "../tables/references";
import { TableColor, TableDataType, TableDefinitions, TableHeaderStyle, TableNumericFormat, TableReference, TableReferenceMap, TableTemporalFormat, TableTheme } from "../tables/types";
import { ObjectPath, Result } from "../util";

type RegistryResolver<T> = (ref: TableReference, path: ObjectPath) => Result<T, TableBookProcessIssue[]>;

const emptyResolver: RegistryResolver<any> = (ref, path) =>
    Result.failure([{ type: 'processing', message: 'Missing reference', path, data: ref }]);

const arrayResolver = <T>(
    refs: TableReferenceMap<T>,
    lookups: TableReferenceLookup<T>[] = []
): RegistryResolver<T> => (ref, path) => {
    const name = ref.slice(1);
    const issues: TableBookProcessIssue[] = [];

    for (const resolver of lookups) {
        if (typeof resolver === 'function') {
            const result = resolver(name);

            if (result.success) {
                refs[name] = result.value;

                return result;
            }
            else if (result.info !== undefined) {
                issues.push({ type: 'processing', message: result.info, path, data: ref });
            }
        }
        else {
            const result = resolver[name];

            if (result !== undefined) {
                refs[name] = result;

                return Result.success(result);
            }
        }
    }

    return issues.length ? Result.failure(issues) : emptyResolver(ref, path);
};

const registryResolver = <T>(registry: TableReferenceRegistry<T>): RegistryResolver<T> => (ref, path) => registry.resolve(ref, path);


export class TableReferenceRegistry<T> {
    #refs: TableReferenceMap<T>;
    #resolver: RegistryResolver<T>;

    constructor(refs: TableReferenceMap<T> | undefined, lookups?: (TableReferenceLookup<T> | undefined)[]) {
        this.#refs = { ...(refs ?? {}) };

        this.#resolver = lookups?.length
            ? arrayResolver(this.#refs, lookups.filter((lookup): lookup is TableReferenceLookup<T> => lookup !== undefined))
            : emptyResolver;
    }

    overlay(refs?: TableReferenceMap<T>): TableReferenceRegistry<T> {
        if (refs) {
            const resolver = new TableReferenceRegistry(refs);

            resolver.#resolver = registryResolver(this);

            return resolver;
        }

        return this;
    }

    resolve(ref: TableReference, path: ObjectPath): Result<T, TableBookProcessIssue[]> {
        const visited = [ref];

        while (true) {
            const name = ref.substring(1);

            const result = this.#refs[name];

            if (result === undefined) {
                return this.#resolver(ref, path);
            }
            else if (isReference(result)) {
                if (visited.includes(result))
                    return Result.failure([{ type: 'processing', message: `Circular reference`, path, data: visited }]);

                visited.push(result);

                ref = result;
            }
            else {
                return Result.success(result);
            }
        }
    }
}

export type TableDefinitionsRegistry = {
    colors: TableReferenceRegistry<TableColor>;
    styles: TableReferenceRegistry<TableHeaderStyle>;
    themes: TableReferenceRegistry<TableTheme>;
    numerics: TableReferenceRegistry<TableNumericFormat>;
    temporals: TableReferenceRegistry<TableTemporalFormat>;
    types: TableReferenceRegistry<TableDataType>;
};

export class TableDefinitionsManager implements TableDefinitionsRegistry {
    #registries: TableDefinitionsRegistry;

    constructor(registries: TableDefinitionsRegistry) {
        this.#registries = registries;
    }

    static new(defintions?: TableDefinitions, resolvers?: TableDefinitionResolver[]) {
        return new TableDefinitionsManager({
            colors: new TableReferenceRegistry(defintions?.colors, resolvers?.map(r => r.colors)),
            styles: new TableReferenceRegistry(defintions?.styles, resolvers?.map(r => r.styles)),
            themes: new TableReferenceRegistry(defintions?.themes, resolvers?.map(r => r.themes)),
            numerics: new TableReferenceRegistry(defintions?.numerics, resolvers?.map(r => r.numerics)),
            temporals: new TableReferenceRegistry(defintions?.temporals, resolvers?.map(r => r.temporals)),
            types: new TableReferenceRegistry(defintions?.types, resolvers?.map(r => r.types)),
        });
    }


    overlay(definitions?: TableDefinitions): TableDefinitionsManager {
        return definitions
            ? new TableDefinitionsManager({
                colors: this.#registries.colors.overlay(definitions.colors),
                styles: this.#registries.styles.overlay(definitions.styles),
                themes: this.#registries.themes.overlay(definitions.themes),
                numerics: this.#registries.numerics.overlay(definitions.numerics),
                temporals: this.#registries.temporals.overlay(definitions.temporals),
                types: this.#registries.types.overlay(definitions.types),
            })
            : this;
    }

    get colors() { return this.#registries.colors; }

    get styles() { return this.#registries.styles; }

    get themes() { return this.#registries.themes; }

    get numerics() { return this.#registries.numerics; }

    get temporals() { return this.#registries.temporals; }

    get types() { return this.#registries.types; }
}