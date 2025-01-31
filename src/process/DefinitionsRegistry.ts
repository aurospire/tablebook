import { TableBookProcessIssue } from "../issues";
import { isReference, TableDefinitionResolver, TableReferenceResolver } from "../tables/references";
import { TableColor, TableColumnType, TableDefinitions, TableHeaderStyle, TableNumericFormat, TableReference, TableReferenceMap, TableTemporalFormat, TableTheme } from "../tables/types";
import { ObjectPath, Result } from "../util";

type RegistryResolver<T> = (ref: TableReference, path: ObjectPath) => Result<T, TableBookProcessIssue[]>;

const emptyResolver: RegistryResolver<any> = (ref, path) =>
    Result.failure([{ type: 'processing', message: 'Missing reference', path, data: ref }]);

const arrayResolver = <T>(
    refs: TableReferenceMap<T>,
    resolvers: TableReferenceResolver<T>[] = []
): RegistryResolver<T> => (ref, path) => {
    const name = ref.slice(1);
    const issues: TableBookProcessIssue[] = [];

    for (const resolver of resolvers) {
        const result = resolver(name);

        if (result.success) {
            refs[name] = result.value;

            return result;
        } else
            issues.push({ type: 'processing', message: result.info, path, data: ref });
    }

    return emptyResolver(ref, path);
};

const registryResolver = <T>(registry: ReferenceRegistry<T>): RegistryResolver<T> => (ref, path) => registry.resolve(ref, path);


export class ReferenceRegistry<T> {
    #refs: TableReferenceMap<T>;
    #resolver: RegistryResolver<T>;

    constructor(refs: TableReferenceMap<T> | undefined, resolvers?: (TableReferenceResolver<T> | undefined)[]) {
        this.#refs = { ...(refs ?? {}) };

        this.#resolver = resolvers?.length
            ? arrayResolver(this.#refs, resolvers.filter((fn): fn is TableReferenceResolver<T> => fn !== undefined))
            : emptyResolver;
    }

    overlay(refs?: TableReferenceMap<T>): ReferenceRegistry<T> {
        if (refs) {
            const resolver = new ReferenceRegistry(refs);

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
    colors: ReferenceRegistry<TableColor>;
    styles: ReferenceRegistry<TableHeaderStyle>;
    themes: ReferenceRegistry<TableTheme>;
    numerics: ReferenceRegistry<TableNumericFormat>;
    temporals: ReferenceRegistry<TableTemporalFormat>;
    types: ReferenceRegistry<TableColumnType>;
};

export class DefinitionsRegistry implements TableDefinitionsRegistry {
    #registries: TableDefinitionsRegistry;

    constructor(registries: TableDefinitionsRegistry) {
        this.#registries = registries;
    }

    static new(defintions?: TableDefinitions, resolvers?: TableDefinitionResolver[]) {
        return new DefinitionsRegistry({
            colors: new ReferenceRegistry(defintions?.colors, resolvers?.map(r => r.colors)),
            styles: new ReferenceRegistry(defintions?.styles, resolvers?.map(r => r.styles)),
            themes: new ReferenceRegistry(defintions?.themes, resolvers?.map(r => r.themes)),
            numerics: new ReferenceRegistry(defintions?.numerics, resolvers?.map(r => r.numerics)),
            temporals: new ReferenceRegistry(defintions?.temporals, resolvers?.map(r => r.temporals)),
            types: new ReferenceRegistry(defintions?.types, resolvers?.map(r => r.types)),
        });
    }


    overlay(definitions?: TableDefinitions): DefinitionsRegistry {
        return definitions
            ? new DefinitionsRegistry({
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