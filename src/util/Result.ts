/**
 * Represents the result of an operation that can either succeed or fail.
 * 
 * @typeParam T - The type of the value returned when the operation is successful.
 * @typeParam I - The type of the additional information provided when the operation fails.
 */
export type Result<T, I> = 
    | { success: true; value: T; }  // Successful result
    | { success: false; info: I; value?: T; };  // Failed result with optional value

/**
 * Utility for creating and handling `Result` objects.
 */
export const Result = Object.freeze({
    /**
     * Creates a successful `Result` object.
     * 
     * @typeParam T - The type of the value returned.
     * @param value - The value associated with the successful operation.
     * @returns A `Result` object representing a successful operation.
     */
    success: <T>(value: T): Result<T, any> => ({ success: true, value }),

    /**
     * Creates a failed `Result` object.
     * 
     * @typeParam I - The type of the additional failure information.
     * @typeParam T - The type of the optional value associated with the failure.
     * @param info - The information describing why the operation failed.
     * @param value - (Optional) The value associated with the failed operation.
     * @returns A `Result` object representing a failed operation.
     */
    failure: <I, T = any>(info: I, value?: T): Result<T, I> => ({ success: false, info, value }),
});
