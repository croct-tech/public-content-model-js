import type { TemplateDefinition } from '../definition';
import type { LogicalTypeSchema } from './logicalTypeSchema';
/**
 * A rich text definition template.
 */
export declare const richTextTemplate: TemplateDefinition<'richText'>;
/**
 * The options for the rich text schema.
 */
export type RichTextSchemaOptions = {
    /**
     * The list of allowed formatting.
     *
     * The set of formatting is application-specific, such as bold, italic, heading, or quote.
     *
     * If not specified, explicit restrictions on the formatting are not imposed
     * on the formatting specified in the definition.
     */
    allowedFormatting?: string[];
};
/**
 * Creates a schema for validating the properties of a rich text definition template.
 *
 * @param options The options for the schema.
 */
export declare function createRichTextSchema(options?: RichTextSchemaOptions): LogicalTypeSchema<'text'>;
declare module '../definition' {
    interface LogicalDefinitionMap {
        /**
         * A rich text, supporting formatting such as bold, italic, headings, and quotes.
         *
         * It is distinct from a regular text in how it is interpreted and
         * displayed by the user interface.
         */
        richText: {
            /**
             * The underlying type.
             */
            type: 'text';
            /**
             * The format of the rich text.
             */
            format?: 'multiline';
            /**
             * The list of allowed formatting.
             *
             * The set of formatting is application-specific, such as bold, italic, heading, or quote.
             *
             * Implementations must prevent the use of formatting not included in the list.
             * If not specified, no restrictions on the formatting are imposed.
             */
            allowedFormatting?: string[];
        };
    }
}
