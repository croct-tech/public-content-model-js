import { JsonPointer } from '@croct/json-pointer';
import type { JsonStructure, JsonValue } from '@croct/json';
/**
 * A placeholder.
 */
export type Placeholder = {
    /**
     * The placeholder pointer.
     */
    pointer: JsonPointer;
    /**
     * The placeholder fallback value.
     */
    fallback: JsonValue | undefined;
};
export declare namespace Placeholder {
    /**
     * A pattern that matches placeholders.
     *
     * This pattern matches all placeholders in a string.
     *
     * There are two capturing groups: the first one matches the placeholder pointer,
     * the second one matches the placeholder fallback value.
     */
    const PATTERN: RegExp;
    /**
     * Extracts the placeholder paths from a string.
     *
     * @param value The string to extract the paths from.
     * @param basePointer The base pointer to resolve relative paths.
     *
     * @returns The list of placeholders in the order they appear in the string.
     */
    function extract(value: JsonValue, basePointer: JsonPointer): Placeholder[];
    /**
     * The options for interpolating placeholders.
     */
    type InterpolationOptions = {
        /**
         * The location of the value that contains the placeholders.
         *
         * This is used to resolve relative paths.
         */
        basePointer?: JsonPointer;
        /**
         * The set of invalid pointers to ignore and use the fallback value instead.
         */
        invalidPointers?: ReadonlySet<string>;
        /**
         * The set of placeholders to ignore and keep as is.
         */
        ignoredPointers?: ReadonlySet<string>;
    };
    /**
     * Interpolates placeholders in a string with the values from the content.
     *
     * @param value The string to interpolate.
     * @param content The content to get the placeholder values from.
     * @param options The options for interpolating placeholders.
     *
     * @returns The string with the placeholders replaced.
     */
    function interpolate(value: string, content: JsonStructure, options?: InterpolationOptions): string;
}
