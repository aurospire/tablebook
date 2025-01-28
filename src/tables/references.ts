import { ObjectPath, Result } from "../util";
import { TableReference } from "./types";

export const isReference = (value: unknown): value is TableReference => typeof value === 'string' && value.startsWith('@');

export type ReferenceResolver<T> = (name: string, path: ObjectPath) => Result<T, string>;
