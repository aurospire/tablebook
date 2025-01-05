export type IssueType = 'parsing' | 'validating' | 'processing' | 'generating';

export interface Issue {
    type: IssueType;
    message: string;
    path?: string;
    data?: string;
}

export const Issue = (type: IssueType, message: string, path?: string, data?: string): Issue => ({ type, message, path, data });