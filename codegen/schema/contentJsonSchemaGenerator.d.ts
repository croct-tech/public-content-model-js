import type { JSONSchema } from 'json-schema-typed';
import type { ContentDefinitionBundle } from '../../definition';
import { ContentDefinition } from '../../definition';
import type { DefinitionBasedGenerator } from '../codeGenerator';
import Visitor = ContentDefinition.Visitor;
/**
 * A documented property.
 */
type PropertyDocs<T extends Record<string, any> = Record<never, never>> = Readonly<T & {
    /**
     * The property title.
     */
    $title: string;
    /**
     * The property description.
     */
    $description: string;
}>;
/**
 * The JSON schema documentation.
 */
export type ContentSchemaDocs = Readonly<{
    primitive: PropertyDocs<{
        type: PropertyDocs;
        value: PropertyDocs<{
            type: PropertyDocs;
            static: {
                value: PropertyDocs;
            };
            dynamic: {
                expression: PropertyDocs;
                default: PropertyDocs;
                nullable: PropertyDocs;
            };
        }>;
    }>;
    list: PropertyDocs<{
        values: PropertyDocs;
        label: PropertyDocs;
    }>;
    structure: PropertyDocs<{
        attributes: PropertyDocs<{
            attribute: PropertyDocs;
        }>;
    }>;
}>;
/**
 * The options for generating the JSON schema.
 */
export type ContentSchemaConfiguration = {
    /**
     * The JSON schema documentation.
     */
    docs?: ContentSchemaDocs;
    /**
     * Whether to inline primitive type schemas.
     *
     * Enabling this option significantly increases the size of the generated
     * schema for large definitions.
     */
    inlinePrimitives?: boolean;
    /**
     * Whether to relax constraints for text values containing placeholders.
     *
     * Because the resulting value is not known at the time of validation, it is
     * not possible to validate constraints for values including placeholders.
     * For example, the `minimumLength` cannot be reliably validated for a value
     * like `{{user.name}}` because the resulting value may be shorter than the
     * minimum length.
     *
     * @default false
     */
    relaxDynamicTextConstraints?: boolean;
    /**
     * The maximum length of strings.
     *
     * No maximum length is enforced by default.
     */
    maximumStringLength?: {
        /**
         * The default maximum length.
         */
        default: number;
        /**
         * The maximum length for multiline strings.
         *
         * If not specified, the default maximum length is used.
         */
        multiline?: number;
        /**
         * The maximum length for url strings.
         *
         * If not specified, the default maximum length is used.
         */
        url?: number;
    };
    /**
     * The maximum number of items in lists.
     *
     * No maximum length is enforced by default.
     */
    maximumListLength?: number;
    /**
     * The maximum length of item labels in lists.
     *
     * No maximum length is enforced by default.
     */
    maximumListItemLabelLength?: number;
    /**
     * Which constraints allow the use of dynamic values.
     */
    allowDynamicValues?: {
        /**
         * The constraints that allow the use of dynamic values in text attributes.
         */
        text?: {
            /**
             * Whether the minimum length constraint allows the use of dynamic values.
             *
             * @default false
             */
            minimumLength?: boolean;
            /**
             * Whether the maximum length constraint allows the use of dynamic values.
             *
             * @default false
             */
            maximumLength?: boolean;
            /**
             * Whether the pattern constraint allows the use of dynamic values.
             *
             * @default false
             */
            pattern?: boolean;
            /**
             * Whether the format constraint allows the use of dynamic values.
             *
             * @default false
             */
            format?: boolean;
            /**
             * Whether the choices constraint prevents the use of dynamic values.
             *
             * @default false
             */
            choices?: boolean;
        };
        /**
         * The constraints that allow the use of dynamic values in number attributes.
         */
        number?: {
            /**
             * Whether the minimum constraint allows the use of dynamic values.
             *
             * @default false
             */
            minimum?: boolean;
            /**
             * Whether the maximum constraint allows the use of dynamic values.
             *
             * @default false
             */
            maximum?: boolean;
            /**
             * Whether the multiple of constraint allows the use of dynamic values.
             *
             * @default false
             */
            integer?: boolean;
        };
    };
    /**
     * Whether to include a custom keyword with the dynamic value type.
     *
     * This keyword can be used by JSON schema validators to asynchronously
     * validate the expression and result type.
     *
     * The keyword is defined as follows:
     * ```json
     * {
     *   "expression": {
     *     "type": "string",
     *     "result": {
     *       "type": "boolean",
     *       "nullable": true
     *     }
     *   }
     * }
     * ```
     *
     * @default false
     */
    includeExpressionType?: boolean;
};
/**
 * A content JSON schema generator.
 *
 * This generator can generate JSON schemas for validating a content against a definition.
 */
export declare class ContentJsonSchemaGenerator implements DefinitionBasedGenerator<ContentDefinitionBundle>, Visitor<JSONSchema.Interface> {
    /**
     * The options for the generator.
     */
    private readonly options;
    /**
     * Constructs a new instance.
     *
     * @param options The options for the generator.
     */
    constructor(options?: ContentSchemaConfiguration);
    /**
     * Generates the schema in JSON format for validating a content against a given definition.
     *
     * @param bundle The bundle to generate the schema based on.
     *
     * @returns The JSON schema in JSON format.
     */
    generate(bundle: ContentDefinitionBundle): string;
    /**
     * Generates the schema in object form for validating a content against a given definition.
     *
     * @param bundle The bundle to generate the schema based on.
     *
     * @returns The JSON schema in object form.
     */
    visitBundle(bundle: ContentDefinitionBundle): JSONSchema.Interface;
    /**
     * Generates the schema in object form for validating a content against the given definition.
     *
     * @param definition The definition to generate the schema based on.
     *
     * @returns The JSON schema in object form.
     */
    visit(definition: ContentDefinition): JSONSchema.Interface;
    /**
     * Creates a visitor for generating JSON schemas.
     *
     * @returns A visitor for generating JSON schemas.
     */
    private getVisitor;
}
export {};
