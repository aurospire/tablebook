import { parse, ParseError, printParseErrorCode } from 'jsonc-parser';
import { LineCounter, parseDocument } from 'yaml';
import { ZodIssue } from 'zod';
import { GoogleGenerator, GoogleSheet } from './google';
import { TableBookGenerateIssue, TableBookParseIssue, TableBookProcessIssue, TableBookValidateIssue } from './issues';
import { MissingReferenceResolvers, processTableBook, TableProcessLogger } from './process';
import { SheetBook, SheetGenerator } from './sheets';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { ObjectPath, Result, TextLocation } from './util';
import { LiteTableBook } from './tables/lite';

/** The result of parsing a TableBook, either successful or containing parse issues. */
export type TableBookParseResult = Result<any, TableBookParseIssue[]>;

/** The result of validating a TableBook, either successful or containing validation issues. */
export type TableBookValidateResult<T> = Result<T, TableBookValidateIssue[]>;

/** The result of processing a TableBook, either successful or containing process issues. */
export type TableBookProcessResult<T> = Result<T, TableBookProcessIssue[]>;

/** The result of generating a TableBook, either successful or containing generation issues. */
export type TableBookGenerateResult = Result<undefined, TableBookGenerateIssue[]>;

/**
 * Derives the text location (line and column) of an index within a string.
 * @param data - The full string to calculate the location from.
 * @param index - The index within the string.
 * @returns The text location as a `TextLocation` object.
 */
const bruteForceLocation = (data: string, index: number): TextLocation => {
    const lines = data.slice(0, index).split('\n');
    return { index, line: lines.length, column: lines[lines.length - 1].length };
};

/**
 * Parses a JSON string into a TableBook object.
 * @param data - The JSON string to parse.
 * @returns A `TableBookParseResult` with the parsed data or parsing issues.
 */
export const parseJson = (data: string): TableBookParseResult => {
    const errors: ParseError[] = [];
    const result = parse(data, errors, { allowEmptyContent: false, allowTrailingComma: true, disallowComments: false });

    return errors.length === 0
        ? Result.success(result)
        : Result.failure(errors.map(error => ({
            type: 'parsing',
            message: printParseErrorCode(error.error),
            location: bruteForceLocation(data, error.offset),
            length: error.length
        })));
};

/**
 * Parses a YAML string into a TableBook object.
 * @param data - The YAML string to parse.
 * @returns A `TableBookParseResult` with the parsed data or parsing issues.
 */
export const parseYaml = (data: string): TableBookParseResult => {
    const result = parseDocument(data, { lineCounter: new LineCounter(), prettyErrors: true, logLevel: 'silent' });

    return result.errors.length === 0
        ? Result.success(result.toJS())
        : Result.failure(result.errors.map(error => ({
            type: 'parsing',
            message: error.message,
            location: {
                index: error.pos[0],
                line: error.linePos?.[0].line ?? -1,
                column: error.linePos?.[0].col ?? -1,
            },
            length: error.pos[1] - error.pos[0]
        })));
};

/**
 * Retrieves a value from a nested data structure using an object path.
 * @param data - The data to retrieve the value from.
 * @param path - The path of keys to follow.
 * @returns The value at the specified path, or `undefined` if not found.
 */
const getData = (data: any, path: ObjectPath): any => {
    let value = data;
    for (const key of path) {
        if (value === undefined) return undefined;
        value = value?.[key];
    }
    return value;
};

/**
 * Maps a Zod validation issue into a TableBook validation issue.
 * @param issue - The Zod issue to map.
 * @param data - The data being validated.
 * @returns A `TableBookValidateIssue` object.
 */
const mapValidatorIssue = (issue: ZodIssue, data: any): TableBookValidateIssue => ({
    type: 'validating',
    message: issue.message,
    path: issue.path,
    value: getData(data, issue.path)
});

/** Utility object for working with TableBook objects. */
export const tablebook = Object.freeze({
    /**
     * Parses an object from JSON or YAML format.
     * @param format - The format of the data (`json` or `yaml`).
     * @param data - The data to parse.
     * @returns A `TableBookParseResult` with the parsed data or parsing issues.
     */
    parse(format: 'json' | 'yaml', data: string): TableBookParseResult {
        return format === 'json' ? parseJson(data) : parseYaml(data);
    },

    /**
     * Validates a TableBook object.
     * @param data - The TableBook data to validate.
     * @returns A `TableBookValidateResult` with the validated data or validation issues.
     */
    validate(data: any): TableBookValidateResult<TableBook> {
        const result = TableBookValidator.safeParse(data);
        return result.success
            ? Result.success(result.data)
            : Result.failure(result.error.issues.map(issue => mapValidatorIssue(issue, data)));
    },

    /**
     * Converts a TableBook into a SheetBook.
     * @param data - The TableBook to convert.
     * @param onMissing - Optional resolvers for missing references.
     * @param logger - Optional logger for processing messages.
     * @returns A `TableBookProcessResult` with the converted data or processing issues.
     */
    process(data: TableBook, onMissing?: MissingReferenceResolvers[], logger?: TableProcessLogger): TableBookProcessResult<SheetBook> {
        return processTableBook(data, onMissing, logger);
    },

    /**
     * Generates a sheet from a SheetBook using a custom generator.
     * @param data - The SheetBook to generate from.
     * @param generator - The generator to use.
     * @returns A promise resolving to a `TableBookGenerateResult`.
     */
    async generate(data: SheetBook, generator: SheetGenerator): Promise<TableBookGenerateResult> {
        return await generator.generate(data);
    },


    /**
     * A collection of utilities for generating TableBook Generators.    
     */
    generators: Object.freeze({
        /**
         * Creates a Google Sheets generator.
         * @param email - The email associated with the Google API.
         * @param key - The API key for authentication.
         * @param sheetId - The ID of the target Google Sheet.
         * @param reset - Whether to reset the sheet's contents before generating new content.
         * @returns A promise resolving to a `SheetGenerator`.
         */
        async google(email: string, key: string, sheetId: string, reset: boolean): Promise<SheetGenerator> {
            const googleSheet = await GoogleSheet.open(email, key, sheetId);

            return new GoogleGenerator(googleSheet, reset);
        }
    })
});
