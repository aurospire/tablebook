export type TextLocation = { index: number, line: number, column: number; };

export type TableBookPath = (string | number)[];

export type TableBookParseIssue = {
    type: 'parsing';
    message: string;
    location: TextLocation;
    length: number;
};

export type TableBookValidateIssue = {
    type: 'validating';
    message: string;
    path: TableBookPath;
};

export type TableBookProcessIssue = {
    type: 'processing';
    message: string;
    path: TableBookPath;
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
    | { success: false; issues: Issue[]; data?: Data; };