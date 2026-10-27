"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Placeholder = void 0;
const json_pointer_1 = require("@croct/json-pointer");
var Placeholder;
(function (Placeholder) {
    /**
     * A pattern that matches placeholders.
     *
     * This pattern matches all placeholders in a string.
     *
     * There are two capturing groups: the first one matches the placeholder pointer,
     * the second one matches the placeholder fallback value.
     */
    Placeholder.PATTERN = new RegExp(
    // Opening delimiter
    '\\{\\{'
        // Zero or more leading spaces
        + ' *'
        + '('
        + '(?:'
        // An absolute or relative property
        + '(?:\\.\\.(?:\\d+\\.)?)?[a-zA-Z_]+\\w*'
        + '|'
        // A relative array index
        + '(?:\\.\\.\\d*)?\\[\\d+\\]'
        + ')'
        // Followed by zero or more properties or array indices
        + '(?:\\.[a-zA-Z_]+\\w*|\\[\\d+\\])*'
        + ')'
        // An optional fallback value without leading or trailing spaces
        + '(?: *\\| *(.*?[^\\\\]))?'
        // Zero or more trailing spaces
        + ' *'
        // Closing delimiter
        + '\\}\\}', 'g');
    /**
     * Parsers a placeholder path into a JSON pointer.
     *
     * @param path The placeholder path.
     * @param basePointer The base pointer to resolve relative paths.
     *
     * @returns An absolute JSON pointer.
     */
    function parsePointer(path, basePointer) {
        let pointer = path.replace(/^\.\.(\d+)?(?:\[(\d+)])?/, (_, level = '', index = '') => (level === ''
            ? `1.${index}`
            : `${level}${index === '' ? '' : `.${index}`}`));
        const isRelative = pointer !== path;
        pointer = pointer.replace(/\[(\d+)]/g, '.$1')
            .replace(/\./g, '/');
        return isRelative
            ? json_pointer_1.JsonRelativePointer.parse(pointer).resolve(basePointer)
            : json_pointer_1.JsonPointer.parse(pointer.startsWith('/') ? pointer : `/${pointer}`);
    }
    /**
     * Extracts the placeholder paths from a string.
     *
     * @param value The string to extract the paths from.
     * @param basePointer The base pointer to resolve relative paths.
     *
     * @returns The list of placeholders in the order they appear in the string.
     */
    function extract(value, basePointer) {
        if (typeof value !== 'string') {
            return [];
        }
        const placeholders = [];
        for (const [, path, fallback] of value.matchAll(Placeholder.PATTERN)) {
            try {
                placeholders.push({
                    pointer: parsePointer(path, basePointer),
                    fallback: fallback,
                });
            }
            catch {
                // fallback
            }
        }
        return placeholders;
    }
    Placeholder.extract = extract;
    /**
     * Formats a value for interpolation.
     *
     * @param value The value to format.
     *
     * @returns The formatted value or `null` if the value is not string, number or boolean.
     */
    function format(value) {
        switch (typeof value) {
            case 'string':
            case 'number':
            case 'boolean':
                return value.toString();
            default:
                return null;
        }
    }
    /**
     * Replaces escape sequences in a string by their corresponding characters.
     *
     * @param value The value to unescape.
     */
    function unescape(value) {
        if (value === '') {
            return value;
        }
        return value.replace(/\\(.)/g, '$1');
    }
    /**
     * Interpolates placeholders in a string with the values from the content.
     *
     * @param value The string to interpolate.
     * @param content The content to get the placeholder values from.
     * @param options The options for interpolating placeholders.
     *
     * @returns The string with the placeholders replaced.
     */
    function interpolate(value, content, options = {}) {
        const { basePointer = json_pointer_1.JsonPointer.root(), invalidPointers = new Set(), ignoredPointers = new Set(), } = options;
        return value.replace(Placeholder.PATTERN, (input, path, escapedFallback = '') => {
            const fallback = unescape(escapedFallback);
            try {
                const pointer = parsePointer(path, basePointer);
                if (ignoredPointers.has(pointer.toString())) {
                    return input;
                }
                if (invalidPointers.has(pointer.toString())) {
                    return fallback;
                }
                const result = pointer.get(content);
                return format(result) ?? fallback;
            }
            catch {
                return fallback;
            }
        });
    }
    Placeholder.interpolate = interpolate;
})(Placeholder || (exports.Placeholder = Placeholder = {}));
