import { ObjectPath, TextLocation } from "./util";

/**
 * Represents an issue encountered during the parsing phase of a `TableBook`.
 */
export type TableBookParseIssue = {
    /** The type of issue, indicating the parsing phase. */
    type: 'parsing';
    /** A descriptive message about the issue. */
    message: string;
    /** The location in the source text where the issue occurred. */
    location: TextLocation;
    /** The length of the problematic text segment. */
    length: number;
};

/**
 * Represents an issue encountered during the validation phase of a `TableBook`.
 */
export type TableBookValidateIssue = {
    /** The type of issue, indicating the validation phase. */
    type: 'validating';
    /** A descriptive message about the issue. */
    message: string;
    /** (Optional) The value that caused the issue. */
    value?: any;
    /** The path in the object hierarchy where the issue occurred. */
    path: ObjectPath;
};

/**
 * Represents an issue encountered during the processing phase of a `TableBook`.
 */
export type TableBookProcessIssue = {
    /** The type of issue, indicating the processing phase. */
    type: 'processing';
    /** A descriptive message about the issue. */
    message: string;
    /** The path in the object hierarchy where the issue occurred. */
    path: ObjectPath;
    /** Additional data associated with the issue. */
    data: any;
};

/**
 * Represents an issue encountered during the generation phase of a `TableBook`.
 */
export type TableBookGenerateIssue = {
    /** The type of issue, indicating the generation phase. */
    type: 'generating';
    /** A descriptive message about the issue. */
    message: string;
    /** Additional data associated with the issue. */
    data: any;
};

/**
 * Union of all possible issue types that can occur when working with a `TableBook`.
 */
export type TableBookIssue = 
    | TableBookParseIssue
    | TableBookValidateIssue
    | TableBookProcessIssue
    | TableBookGenerateIssue;
