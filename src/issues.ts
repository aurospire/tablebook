import { ObjectPath, TextLocation } from "./util";

export type TableBookParseIssue = {
    type: 'parsing';
    message: string;
    location: TextLocation;
    length: number;
};

export type TableBookValidateIssue = {
    type: 'validating';
    message: string;
    path: ObjectPath;
};

export type TableBookProcessIssue = {
    type: 'processing';
    message: string;
    path: ObjectPath;
    data: any;
};

export type TableBookGenerateIssue = {
    type: 'generating';
    message: string;
    data: any;
};

export type TableBookIssue = TableBookParseIssue | TableBookValidateIssue | TableBookProcessIssue | TableBookGenerateIssue;