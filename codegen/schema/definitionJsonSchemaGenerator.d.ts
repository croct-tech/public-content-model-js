import type { JSONSchema } from 'json-schema-typed';
import type { ContentDefinitionType } from '../../definition';
import type { LogicalTypeSchema } from '../../definition/logicalTypes';
import type { CodeGenerator } from '../codeGenerator';
/**
 * A documented property.
 */
type PropertyDocs<T extends Record<string, any> = Record<never, never>> = Readonly<T & {
    $title: string;
    $description: string;
}>;
/**
 * A property documented with examples.
 */
type PropertyDocsWithExamples<T extends Record<string, any> = Record<never, never>> = PropertyDocs<T & {
    $examples: string[];
}>;
/**
 * The JSON schema documentation.
 */
export type DefinitionSchemaDocs = {
    definition: PropertyDocs<{
        type: PropertyDocs;
        title: PropertyDocsWithExamples;
        description: PropertyDocsWithExamples;
    }>;
    boolean: PropertyDocs<{
        type: PropertyDocs;
        label: PropertyDocs<{
            true: PropertyDocsWithExamples;
            false: PropertyDocsWithExamples;
        }>;
        default: PropertyDocs;
    }>;
    number: PropertyDocs<{
        type: PropertyDocs;
        integer: PropertyDocs;
        minimum: PropertyDocs;
        maximum: PropertyDocs;
    }>;
    text: PropertyDocs<{
        type: PropertyDocs;
        minimumLength: PropertyDocs;
        maximumLength: PropertyDocs;
        format: PropertyDocs;
        pattern: PropertyDocsWithExamples;
        choices: PropertyDocs<{
            label: PropertyDocsWithExamples;
            description: PropertyDocsWithExamples;
            default: PropertyDocs;
            position: PropertyDocs;
        }>;
    }>;
    list: PropertyDocs<{
        type: PropertyDocs;
        items: PropertyDocs;
        itemLabel: PropertyDocsWithExamples;
        minimumLength: PropertyDocs;
        maximumLength: PropertyDocs;
    }>;
    structure: PropertyDocs<{
        type: PropertyDocs;
        attributes: PropertyDocs<{
            label: PropertyDocsWithExamples;
            description: PropertyDocsWithExamples;
            optional: PropertyDocs;
            private: PropertyDocs;
            position: PropertyDocs;
        }>;
    }>;
    union: PropertyDocs<{
        type: PropertyDocs;
        types: PropertyDocs;
    }>;
    reference: PropertyDocs<{
        type: PropertyDocs;
        id: PropertyDocs;
    }>;
};
type DefinitionFeatureOptions = {
    /**
     * The allowed root definitions.
     *
     * @default 'structure-or-union'
     */
    rootDefinition?: 'structure' | 'union' | 'structure-or-union' | 'any';
    /**
     * The maximum depth of the schema.
     *
     * Note that providing the reference metadata is required for accurate depth validation.
     *
     * No limit by default.
     */
    maximumDepth?: number;
    /**
     * The maximum length of annotation titles.
     *
     * If omitted, allows any length.
     */
    maximumTitleLength?: number;
    /**
     * The minimum length of annotation titles.
     *
     * If omitted, the minimum length is 1.
     */
    minimumTitleLength?: number;
    /**
     * The maximum length of annotation descriptions.
     *
     * If omitted, allows any length.
     */
    maximumDescriptionLength?: number;
    /**
     * Whether to allow annotations on root definitions only.
     *
     * Allows annotations on any definition by default.
     */
    rootAnnotationsOnly?: boolean;
    /**
     * Whether to allow primitive values in lists only.
     *
     * Allows any type by default.
     *
     * @default false
     */
    primitiveListItemsOnly?: boolean;
    /**
     * Whether to allow union of references only.
     *
     * Allows references and structures by default.
     *
     * @default false
     */
    unionReferenceOnly?: boolean;
    /**
     * Whether discriminators must match reference IDs in union definitions.
     *
     * Note that specifying the references are required to enforce this requirement.
     *
     * Allows any non-empty discriminator by default.
     *
     * @default false
     */
    requiresUnionDiscriminatorPairing?: boolean;
    /**
     * The pattern allowed for the discriminators.
     *
     * Allows any non-empty string by default.
     *
     * @default false
     */
    unionDiscriminatorPattern?: string;
    /**
     * The maximum number of types allowed in a union.
     *
     * No limit by default.
     */
    maximumUnionCardinality?: number;
    /**
     * The pattern allowed for attribute names.
     *
     * Allows any non-empty string by default.
     */
    attributeNamePattern?: string;
    /**
     * The minimum length of attribute names.
     *
     * If omitted, allows any length.
     */
    minimumAttributeNameLength?: number;
    /**
     * The maximum length of attribute names.
     *
     * If omitted, allows any length.
     */
    maximumAttributeNameLength?: number;
    /**
     * The maximum length of attribute labels.
     *
     * If omitted, allows any length.
     */
    maximumAttributeLabelLength?: number;
    /**
     * The maximum length of attribute descriptions.
     *
     * If omitted, allows any length.
     */
    maximumAttributeDescriptionLength?: number;
    /**
     * The maximum number of attributes allowed in a single structure.
     *
     * No limit by default.
     */
    maximumAttributesPerStructure?: number;
    /**
     * Whether to disallow empty structures.
     *
     * An empty structure is one that has no attributes.
     *
     * Allows empty structures by default.
     *
     * @default false
     */
    nonEmptyStructure?: boolean;
    /**
     * Whether to disallow conflicting constraints.
     *
     * Conflicting constraints are those that may not be able to be satisfied together.
     * For example, specifying a pattern and a minimum length for a text attribute
     * may result in a conflict if the pattern does not match the minimum length.
     *
     * Currently, only the text definition has potentially conflicting constraints.
     * These constraints are:
     *
     * - `minimumLength` and `maximumLength`
     * - `pattern`
     * - `format`
     * - `choices`
     *
     * If this option is enabled, these options become mutually exclusive, meaning
     * that only one of them can be specified at a time. For example, if `minimumLength`
     * is specified, `maximumLength` is allowed, but `pattern`, `format`, and `choices`
     * are not.
     *
     * @default false
     */
    nonConflictingConstraints?: boolean;
    /**
     * The maximum length of text attributes.
     *
     * If omitted, allows any length.
     */
    maximumStringLength?: number;
    /**
     * The maximum number of elements in a list.
     *
     * If omitted, allows any length.
     */
    maximumListLength?: number;
    /**
     * The maximum length of list item labels.
     *
     * If omitted, allows any length.
     */
    maximumItemLabelLength?: number;
    /**
     * The maximum length of boolean labels.
     *
     * If omitted, allows any length.
     */
    maximumBooleanLabelLength?: number;
    /**
     * The maximum length of text patterns.
     *
     * If omitted, allows any length.
     */
    maximumPatternLength?: number;
    /**
     * The maximum number of choices in a text attribute.
     *
     * If omitted, allows any number of choices.
     */
    maximumChoices?: number;
    /**
     * The maximum length of choice values.
     *
     * If omitted, allows any length.
     */
    maximumChoiceValueLength?: number;
    /**
     * The maximum length of choice labels.
     *
     * If omitted, allows any length.
     */
    maximumChoiceLabelLength?: number;
    /**
     * The maximum length of choice descriptions.
     *
     * If omitted, allows any length.
     */
    maximumChoiceDescriptionLength?: number;
    /**
     * Whether to include a custom keyword for enforcing a single default choice.
     *
     * This keyword can be used by JSON schema validators to enforce that only one
     * choice is marked as the default.
     *
     * The keyword is defined as follows:
     * ```json
     * {
     *   "properties": {
     *      "choices": {
     *        "type": "object",
     *        "exclusiveFlag": "default"
     *       }
     *     }
     * }
     * ```
     *
     * @default false
     */
    enforceSingleDefaultChoice?: boolean;
    /**
     * The schema documentation.
     */
    docs: DefinitionSchemaDocs;
};
/**
 * A map defining which optional standard feature to support.
 *
 * All features are enabled by default.
 */
type StandardFeaturesToggle = Readonly<{
    /**
     * Whether to emit features in lenient mode.
     *
     * In lenient mode, the emitted schema features are emitted without strict checking constraints
     * involving empty labels, descriptions, and other properties.
     */
    lenientMode?: boolean;
    /**
     * Boolean features.
     */
    boolean?: Readonly<{
        /**
         * Whether to support defining labels for boolean values.
         *
         * @default true
         */
        label?: boolean;
        /**
         * Whether to support defining a default value for boolean values.
         *
         * @default true
         */
        default?: boolean;
    }>;
    /**
     * Number features.
     */
    number?: Readonly<{
        /**
         * Whether to support restricting numbers to integers only.
         *
         * @default true
         */
        integer?: boolean;
        /**
         * Whether to support defining a minimum value for numbers.
         *
         * @default true
         */
        minimum?: boolean;
        /**
         * Whether to support defining a maximum value for numbers.
         *
         * @default true
         */
        maximum?: boolean;
    }>;
    /**
     * Text features.
     */
    text?: Readonly<{
        /**
         * Whether to support defining a maximum length for text values.
         *
         * @default true
         */
        minimumLength?: boolean;
        /**
         * Whether to support defining a maximum length for text values.
         *
         * @default true
         */
        maximumLength?: boolean;
        /**
         * Whether to support defining a pre-defined format for text values.
         */
        format?: {
            /**
             * Whether to support the color format.
             *
             * @default true
             */
            color?: boolean;
            /**
             * Whether to support the URL format.
             *
             * @default true
             */
            url?: boolean;
            /**
             * Whether to support multiline format.
             */
            multiline?: boolean;
            /**
             * Whether to support the local date format.
             *
             * @default true
             */
            localDate?: boolean;
            /**
             * Whether to support the local time format.
             *
             * @default true
             */
            localTime?: boolean;
            /**
             * Whether to support the local date-time format.
             *
             * @default true
             */
            localDateTime?: boolean;
            /**
             * Whether to support the zoned date-time format.
             *
             * @default true
             */
            zonedDateTime?: boolean;
            /**
             * Whether to support the instant format.
             *
             * @default true
             */
            instant?: boolean;
        };
        /**
         * Whether to support defining a regular expression for text values.
         *
         * @default true
         */
        pattern?: boolean;
        /**
         * Whether to support defining a set of allowed values for text values.
         *
         * @default true
         */
        choices?: boolean;
    }>;
    /**
     * List features.
     */
    list?: Readonly<{
        /**
         * Whether to support defining a label for list items.
         *
         * @default true
         */
        itemLabel?: boolean;
        /**
         * Whether to support defining a minimum number of items required in a list.
         *
         * @default true
         */
        minimumLength?: boolean;
        /**
         * Whether to support defining a maximum number of items allowed in a list.
         *
         * @default true
         */
        maximumLength?: boolean;
    }>;
    /**
     * Structure features.
     */
    structure?: Readonly<{
        /**
         * Whether to support defining a title for a structure.
         *
         * @default true
         */
        title?: boolean;
        /**
         * Whether to support defining a description for a structure.
         *
         * @default true
         */
        description?: boolean;
        /**
         * Structure attribute features.
         */
        attributes?: Readonly<{
            /**
             * Whether to support defining a label for an attribute.
             *
             * @default true
             */
            label?: boolean;
            /**
             * Whether to support defining a description for an attribute.
             *
             * @default true
             */
            description?: boolean;
            /**
             * Whether to support defining an attribute as optional.
             *
             * @default true
             */
            optional?: boolean;
            /**
             * Whether to support defining an attribute as private.
             *
             * @default true
             */
            private?: boolean;
            /**
             * Whether to support defining the attribute's position for display purposes.
             *
             * @default true
             */
            position?: boolean;
        }>;
    }>;
}>;
/**
 * The supported feature extensions.
 */
type Extension = 'ajv';
/**
 * Reference metadata used for generating the schema.
 */
type ReferenceMetadata = {
    [T in ContentDefinitionType]: {
        /**
         * The depth of the reference including nested references.
         *
         * The depth must be computed as follows:
         * - The root has a depth of 0
         * - Each level of nesting counts as 1
         * - List item counts as a level of nesting
         * - References and unions do not count as a level of nesting
         * - The depth of referenced schemas, both directly and indirectly, must be added to the depth
         */
        depth: number;
        /**
         * The type of the content.
         */
        type: T;
        /**
         * Whether the properties of this reference is completely optional.
         *
         * When this is true, the `properties` field of the reference is optional.
         */
        fullyOptional?: boolean;
        /**
         * The schema of additional properties for the referenced definition.
         */
        schema?: LogicalTypeSchema<T>;
    };
}[ContentDefinitionType];
/**
 * The configuration for generating the schema.
 */
export type DefinitionSchemaConfiguration = Omit<DefinitionFeatureOptions, 'docs'> & {
    /**
     * The validator-specific features to support.
     *
     * Defaults to the standard JSON schema features.
     */
    extension?: Extension;
    /**
     * The features to support.
     *
     * All features are enabled by default.
     *
     * @default StandardFeaturesToggle
     */
    features?: StandardFeaturesToggle;
    /**
     * The map of reference IDs to metadata.
     *
     * If omitted, allows any non-empty string as a reference ID.
     *
     * Note that specifying the references is required for accurate depth validation.
     *
     * Allows any reference ID by default.
     */
    references?: Record<string, ReferenceMetadata>;
    /**
     * The schema documentation.
     *
     * Defaults to a documentation in English.
     */
    docs?: DefinitionSchemaDocs;
};
/**
 * A JSON schema generator for validating content definitions.
 */
export declare class DefinitionJsonSchemaGenerator implements CodeGenerator {
    /**
     * The default documentation.
     */
    private static readonly DEFAULT_DOCS;
    /**
     * The configuration for generating the schema.
     */
    private readonly configuration;
    /**
     * The features to support.
     */
    private readonly features;
    /**
     * Construct a new instance.
     *
     * @param configuration The configuration for generating the schema.
     */
    constructor(configuration?: DefinitionSchemaConfiguration);
    /**
     * Creates a lenient schema generator.
     *
     * This static factory method configures a generator for generating schemas
     * that validate schemas without strict checking constraints involving empty labels,
     * descriptions, and other properties.
     *
     * @param options The configuration options.
     */
    static lenient(options?: Pick<DefinitionSchemaConfiguration, 'features' | 'extension' | 'references' | 'docs'>): DefinitionJsonSchemaGenerator;
    /**
     * Returns the features to support.
     *
     * @param extension The validator-specific features to support.
     * @param features The standard features to support.
     *
     * @returns The features to support.
     */
    private static getSchemaFeatures;
    /**
     * Generate the JSON schema for validating content definitions.
     *
     * @return The JSON schema in JSON notation.
     */
    generate(): string;
    /**
     * Generate the JSON schema for validating content definitions.
     *
     * @return The JSON schema in object form.
     */
    generateSchema(): JSONSchema.Object;
    /**
     * Generates schemas for validating definitions at different depths.
     *
     * @param maximumDepth The maximum depth for generating schemas.
     *
     * @return A map of schemas for validating definitions at different depths.
     */
    private generateDepthDefinitions;
    /**
     * Generates a schema for validating the root definition.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateRootSchema;
    /**
     * Returns the schema for validating definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getDefinitionSchema;
    /**
     * Generates a schema for validating definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateDefinitionSchema;
    /**
     * Returns the schema for validating a boolean definition.
     *
     * @return The schema for validating a boolean definition.
     */
    private getBooleanSchema;
    /**
     * Creates the schema for validating a boolean definition.
     *
     * @return The schema for validating a boolean definition.
     */
    private createBooleanSchema;
    /**
     * Returns the schema for validating a number definition.
     *
     * @return The schema for validating a number definition.
     */
    private getNumberSchema;
    /**
     * Creates the schema for validating a number definition.
     *
     * @return The schema for validating a number definition.
     */
    private createNumberSchema;
    /**
     * Returns the schema for validating a text definition.
     *
     * @return The schema for validating a text definition.
     */
    private getTextSchema;
    /**
     * Returns the schemas for validating logical definitions with at most the given depth.
     */
    private createLogicalTypeSchemas;
    /**
     * Creates the schema for validating a text definition.
     *
     * @return The schema for validating a text definition.
     */
    private createTextSchema;
    private getPropertySchemas;
    private getTextSchemaProperties;
    /**
     * Returns the schema for validating list definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getListSchema;
    /**
     * Generates a schema for validating list definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateListSchema;
    /**
     * Returns the schema for validating list items with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getListItemSchema;
    /**
     * Returns the schema for validating structure definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getStructureSchema;
    /**
     * Generates a schema for validating structure definitions with at most the given depth.
     *
     * @param options The options for generating the schema.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateStructureSchema;
    /**
     * Returns the schema for validating union definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getUnionSchema;
    /**
     * Returns the schema for validating union definitions with at most the given depth.
     *
     * @param options The options for generating the schema.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateUnionSchema;
    /**
     * Creates a union schema.
     *
     * @param options The options for creating the union schema.
     *
     * @return The union schema.
     */
    private createUnionSchema;
    /**
     * Returns the schema for validating reference definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     * @param unionMember Whether to only include references that are valid union members.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private getReferenceSchema;
    /**
     * Generates a schema for validating reference definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     * @param unionMember Whether to only include references that are valid union members.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    private generateReferenceSchema;
    /**
     * Creates a schema for validating references
     *
     * If the set of references is empty, allows any non-empty string as a reference identifier.
     * Otherwise, allows the identifiers in the set only.
     *
     * @param references The set of reference identifiers.
     *
     * @return The schema for validating references.
     */
    private createReferenceSchema;
    /**
     * Returns the reference identifiers matching the given criteria.
     *
     * @param maximumDepth The maximum depth that the references should have.
     * @param unionMember Whether to include only valid union members.
     *
     * @return If a maximum depth is specified, the result is the set of identifiers for all
     * references with a depth less than or equal to the given maximum depth, excluding
     * references that are not valid union members if the union member flag is set.
     */
    private getReferences;
    private getNonRootAnnotationProperties;
    private getAnnotationProperties;
    /**
     * Creates a switch definition schema.
     *
     * @param branches The branches of the switch.
     *
     * @return The switch definition schema.
     */
    private createSchemaSwitch;
    private get isCheckedReferences();
    /**
     * Remove all properties from the given map that matches nothing.
     *
     * @param properties The map of properties.
     *
     * @return The map of properties whose schema is not `false`.
     */
    private static cleanSchemaProperties;
    private static getLogicalTypeRefId;
    /**
     * Returns a hash for a logical type name.
     *
     * The purpose of this hash is to act as a seed and decrease the
     * likelihood of collisions among identifiers for logical type names.
     *
     * Although the result is not guaranteed to be unique for different types,
     * but the collision probability is low enough for practical purposes.
     *
     * @param id The type name.
     */
    private static getLogicalTypeCode;
}
export {};
