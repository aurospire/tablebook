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


    /**
     * Checks if a value is a `Result` object.
     * 
     * @param value - The value to check.
     * @returns `true` if the value is a `Result` object, `false` otherwise.
     */
    isResult: (value: any): value is Result<any, any> => {
        return typeof value === 'object' && value !== null && 'success' in value;
    },

    /**
     * Unwraps a `Result` object by returning the successful value or handling the failure case.
     * 
     * @typeParam T - The type of the value returned when the operation is successful.
     * @typeParam I - The type of the additional information provided when the operation fails.
     * @typeParam O - The type of the return value from the `onFailure` function.
     * @param result - The `Result` object to unwrap.
     * @param onFailure - A callback function that handles the failure case and returns a fallback value.
     * @returns The successful value if the result is successful, otherwise the value returned by `onFailure`.
     */
    unwrap: <T, I, O = void>(result: Result<T, I>, onFailure: (info: I) => O): T | O => {
        return result.success ? result.value : onFailure(result.info);
    }
});
