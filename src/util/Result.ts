export type Result<T, I> = { success: true; value: T; } | { success: false; info: I; value?: T; };

export const Result = Object.freeze({
    success: <T>(value: T): Result<T, any> => ({ success: true, value }),
    failure: <I, T = any>(info: I, value?: T): Result<T, I> => ({ success: false, info, value })
});