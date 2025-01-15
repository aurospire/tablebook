export type TextLocation = { index: number, line: number, column: number; };

export type TableBookParseIssue = {
    type: 'parsing';
    message: string;
    location: TextLocation;
    length: number;
};

export type TableBookValidateIssue = {
    type: 'validating';
    message: string;
    path: (string | number)[];
};

export type TableBookProcessIssue = {
    type: 'processing';
    message: string;
    path: (string | number)[];
    data: any;
};

export type TableBookGenerateIssue = {
    type: 'generating';
    message: string;
    data: any;
};

export type TableBookIssue = TableBookParseIssue | TableBookValidateIssue | TableBookProcessIssue | TableBookGenerateIssue;

export type TableBookResult<Data, Issue extends TableBookIssue> =
    | { success: true; data: Data; }
    | { success: false; issues: Issue[]; };