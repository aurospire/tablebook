export * from './Color';
export * from './Result';

/** Represents a path to a specific property in a nested object. */
export type ObjectPath = (string | number)[];

/** Represents the location of text within a document. */
export type TextLocation = {
    /** The absolute index of the text in the document. */
    index: number;
    /** The line number where the text is located (1-based). */
    line: number;
    /** The column number where the text starts (0-based). */
    column: number;
};
