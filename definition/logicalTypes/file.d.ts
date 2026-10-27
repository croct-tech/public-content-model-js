import type { JSONSchema } from 'json-schema-typed';
import type { TemplateDefinition } from '../definition';
/**
 * A file definition template.
 */
export declare const fileTemplate: TemplateDefinition<'file'>;
/**
 * The options for the file schema.
 */
export type FileSchemaOptions = {
    /**
     * The list of allowed file types.
     *
     * While any string can be used as a file type, it is recommended to use
     * IANA media types as defined in RFC 6838. This allows for standardized
     * identification of file types across different implementations.
     *
     * If not specified, explicit restrictions on the file type are not imposed
     * on the file types specified in the definition.
     */
    allowedTypes?: string[];
    /**
     * The minimum allowed file size in bytes, inclusive.
     *
     * This is not a validation of the actual file size, but rather the minimum size
     * that can be specified in the definition.
     *
     * If not specified, no restrictions on the file minimum size are imposed.
     */
    minimumSize?: number;
    /**
     * The maximum allowed file size in bytes, inclusive.
     *
     * This is not a validation of the actual file size, but rather the maximum size
     * that can be specified in the definition.
     *
     * If not specified, no restrictions on the file maximum size are imposed.
     */
    maximumSize?: number;
    /**
     * Whether the minimum size must be validated against the maximum size.
     *
     * This option enables the use of the $data keyword to validate the minimum size
     * against the maximum size, preventing inconsistencies in the definition. For example,
     * if the maximum size is 1024, the minimum size must be less than or equal to 1024.
     *
     * Since the $data keyword is not supported by all implementations, make sure
     * to check the compatibility of the implementation before using this option.
     *
     * @default false
     */
    validateSizeRange?: boolean;
};
/**
 * Creates a schema for validating the properties of a file definition template.
 *
 * @param options The options for the schema.
 */
export declare function createFileSchema(options?: FileSchemaOptions): JSONSchema.Object;
declare module '../definition' {
    interface LogicalDefinitionMap {
        /**
         * A file type.
         *
         * Implementations may choose to validate the URL against a known list of file types.
         */
        file: {
            /**
             * The underlying type.
             */
            type: 'text';
            /**
             * The list of allowed file types.
             *
             * While any string can be used as a file type, it is recommended to use
             * IANA media types as defined in RFC 6838. This allows for standardized
             * identification of file types across different implementations.
             *
             * Implementations may further restrict the list of allowed types.
             * If not specified, no restrictions on the file type are imposed.
             *
             * @see https://www.iana.org/assignments/media-types/media-types.xhtml
             */
            allowedTypes?: string[];
            /**
             * The maximum allowed file size in bytes.
             *
             * Implementations must prevent the upload of files larger than the specified size.
             * When not specified, is up to the implementation to decide whether to impose
             * a maximum file size.
             */
            minimumSize?: number;
            /**
             * The maximum allowed file size in bytes.
             *
             * Implementations must prevent the upload of files larger than the specified size.
             * When not specified, is up to the implementation to decide whether to impose
             * a maximum file size.
             */
            maximumSize?: number;
        };
    }
}
