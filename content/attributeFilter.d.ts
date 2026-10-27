import type { JsonPointerSegment } from '@croct/json-pointer';
import { JsonPointer } from '@croct/json-pointer';
import type { JsonObject } from '@croct/json';
/**
 * The options for the attribute filter.
 */
export type AttributeFilterOptions = {
    /**
     * The list of attributes to remove from the content.
     */
    attributes: JsonPointer[];
    /**
     * The name of the discriminator attribute.
     */
    discriminatorAttribute: JsonPointerSegment;
};
/**
 * A filter that removes attributes from a JSON object.
 */
export declare class AttributeFilter {
    /**
     * The pointer to the discriminator attribute starting from the root of the content.
     */
    private readonly discriminatorPointer;
    /**
     * The list of attributes to remove from the content.
     */
    private readonly attributes;
    /**
     * Initialize the attribute filter.
     *
     * @param options The options for the filter.
     */
    constructor(options: AttributeFilterOptions);
    /**
     * Remove the specified attributes from the content without modifying the original object.
     *
     * @param content The content to filter.
     *
     * @returns The filtered content.
     */
    filter(content: JsonObject): JsonObject;
    /**
     * Unset an attribute from a JSON object.
     *
     * @param pointer The pointer to the attribute.
     * @param content The JSON object.
     *
     * @throws {Error} If the operation fails.
     */
    private unset;
}
