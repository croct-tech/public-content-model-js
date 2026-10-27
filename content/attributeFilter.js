"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeFilter = void 0;
const json_pointer_1 = require("@croct/json-pointer");
/**
 * A filter that removes attributes from a JSON object.
 */
class AttributeFilter {
    /**
     * Initialize the attribute filter.
     *
     * @param options The options for the filter.
     */
    constructor(options) {
        this.discriminatorPointer = json_pointer_1.JsonPointer.from([options.discriminatorAttribute]);
        this.attributes = options.attributes;
    }
    /**
     * Remove the specified attributes from the content without modifying the original object.
     *
     * @param content The content to filter.
     *
     * @returns The filtered content.
     */
    filter(content) {
        const filteredContent = structuredClone(content);
        for (const pointer of this.attributes) {
            try {
                this.unset(pointer, filteredContent);
            }
            catch {
                // Ignore errors
            }
        }
        return filteredContent;
    }
    /**
     * Unset an attribute from a JSON object.
     *
     * @param pointer The pointer to the attribute.
     * @param content The JSON object.
     *
     * @throws {Error} If the operation fails.
     */
    unset(pointer, content) {
        if (typeof content !== 'object' || content == null) {
            return;
        }
        const segments = pointer.getSegments();
        const splitIndex = segments.findIndex(segment => segment === '*' || `${segment}`.startsWith('?'));
        if (splitIndex === -1) {
            pointer.unset(content);
            return;
        }
        const currentPointer = json_pointer_1.JsonPointer.from(segments.slice(0, splitIndex));
        const remainderPointer = json_pointer_1.JsonPointer.from(segments.slice(splitIndex + 1));
        const structure = currentPointer.get(content);
        const segment = `${segments[splitIndex]}`;
        if (segment.startsWith('?')) {
            const discriminator = segment.slice(1);
            if (this.discriminatorPointer.get(structure) !== discriminator) {
                return;
            }
            return this.unset(remainderPointer, structure);
        }
        if (!Array.isArray(structure)) {
            return;
        }
        for (const item of structure) {
            this.unset(remainderPointer, item);
        }
    }
}
exports.AttributeFilter = AttributeFilter;
