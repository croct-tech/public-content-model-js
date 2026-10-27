"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefinitionJsonSchemaGenerator = void 0;
/**
 * Standard JSON schema features.
 */
class StandardFeatures {
    /**
     * Creates a new instance.
     *
     * @param features The map of features to support.
     */
    constructor(features = {}) {
        this.features = features;
    }
    get lenientMode() {
        return this.features.lenientMode === true;
    }
    getTitleSchema(options) {
        const { docs, maximumTitleLength, minimumTitleLength } = options;
        return this.features.structure?.title === false
            ? false
            : {
                type: 'string',
                title: docs.definition.title.$title,
                description: docs.definition.title.$description,
                examples: docs.definition.title.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        minLength: minimumTitleLength ?? 1,
                        ...(maximumTitleLength !== undefined
                            ? { maxLength: maximumTitleLength }
                            : {}),
                    }),
            };
    }
    getDescriptionSchema(options) {
        const { docs, maximumDescriptionLength } = options;
        return this.features.structure?.description === false
            ? false
            : {
                type: 'string',
                title: docs.definition.description.$title,
                description: docs.definition.description.$description,
                examples: docs.definition.description.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        minLength: 1,
                        ...(maximumDescriptionLength !== undefined
                            ? { maxLength: maximumDescriptionLength }
                            : {}),
                    }),
            };
    }
    getBooleanLabelSchema(options) {
        const { docs, maximumBooleanLabelLength } = options;
        const featureDocs = docs.boolean.label;
        return this.features.boolean?.label === false
            ? false
            : {
                type: 'object',
                title: featureDocs.$title,
                description: featureDocs.$description,
                properties: {
                    true: {
                        type: 'string',
                        title: featureDocs.true.$title,
                        description: featureDocs.true.$description,
                        examples: featureDocs.true.$examples,
                        ...(this.lenientMode
                            ? {}
                            : {
                                minLength: 1,
                                ...(maximumBooleanLabelLength !== undefined
                                    ? { maxLength: maximumBooleanLabelLength }
                                    : {}),
                            }),
                    },
                    false: {
                        type: 'string',
                        title: featureDocs.false.$title,
                        description: featureDocs.false.$description,
                        examples: featureDocs.false.$examples,
                        ...(this.lenientMode
                            ? {}
                            : {
                                minLength: 1,
                                ...(maximumBooleanLabelLength !== undefined
                                    ? { maxLength: maximumBooleanLabelLength }
                                    : {}),
                            }),
                    },
                },
                required: this.lenientMode
                    ? []
                    : [
                        'true',
                        'false',
                    ],
                additionalProperties: false,
            };
    }
    getBooleanDefaultSchema({ docs }) {
        return this.features.boolean?.default === false
            ? false
            : {
                type: 'boolean',
                title: docs.boolean.default.$title,
                description: docs.boolean.default.$description,
            };
    }
    getNumberIntegerSchema({ docs }) {
        return this.features.number?.integer === false
            ? false
            : {
                type: 'boolean',
                title: docs.number.integer.$title,
                description: docs.number.integer.$description,
            };
    }
    getNumberMinimumSchema({ docs }) {
        return this.features.number?.minimum === false
            ? false
            : {
                type: 'number',
                title: docs.number.minimum.$title,
                description: docs.number.minimum.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: Number.MIN_SAFE_INTEGER,
                        maximum: Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getNumberMaximumSchema({ docs }) {
        return this.features.number?.maximum === false
            ? false
            : {
                type: 'number',
                title: docs.number.maximum.$title,
                description: docs.number.maximum.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: Number.MIN_SAFE_INTEGER,
                        maximum: Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getTextMinimumLengthSchema(props) {
        const { docs, maximumStringLength } = props;
        return this.features.text?.minimumLength === false
            ? false
            : {
                type: 'number',
                title: docs.text.minimumLength.$title,
                description: docs.text.minimumLength.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: 0,
                        maximum: maximumStringLength ?? Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getTextMaximumLengthSchema(props) {
        const { docs, maximumStringLength } = props;
        return this.features.text?.maximumLength === false
            ? false
            : {
                type: 'number',
                title: docs.text.maximumLength.$title,
                description: docs.text.maximumLength.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: 0,
                        maximum: maximumStringLength ?? Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getTextPatternSchema({ docs, maximumPatternLength }) {
        return this.features.text?.pattern === false
            ? false
            : {
                type: 'string',
                title: docs.text.pattern.$title,
                description: docs.text.pattern.$description,
                examples: docs.text.pattern.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        format: 'regex',
                        minLength: 1,
                        ...(maximumPatternLength !== undefined ? { maxLength: maximumPatternLength } : {}),
                    }),
            };
    }
    getTextFormatSchema({ docs }) {
        const toggle = this.features.text?.format;
        const formats = [];
        if (toggle?.color !== false) {
            formats.push('color');
        }
        if (toggle?.url !== false) {
            formats.push('url');
        }
        if (toggle?.multiline !== false) {
            formats.push('multiline');
        }
        if (toggle?.localDate !== false) {
            formats.push('local-date');
        }
        if (toggle?.localTime !== false) {
            formats.push('local-time');
        }
        if (toggle?.localDateTime !== false) {
            formats.push('local-date-time');
        }
        if (toggle?.zonedDateTime !== false) {
            formats.push('zoned-date-time');
        }
        if (toggle?.instant !== false) {
            formats.push('instant');
        }
        if (formats.length === 0) {
            return false;
        }
        return {
            type: 'string',
            title: docs.text.format.$title,
            description: docs.text.format.$description,
            ...(this.lenientMode ? {} : { enum: formats }),
        };
    }
    getTextChoicesSchema(options) {
        const { docs, maximumChoiceValueLength, maximumChoiceLabelLength, maximumChoiceDescriptionLength, maximumChoices, enforceSingleDefaultChoice = false, } = options;
        return this.features.text?.choices === false
            ? false
            : {
                type: 'object',
                title: docs.text.choices.$title,
                description: docs.text.choices.$description,
                ...(enforceSingleDefaultChoice && !this.lenientMode
                    ? { exclusiveFlag: 'default' }
                    : {}),
                additionalProperties: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                            title: docs.text.choices.label.$title,
                            description: docs.text.choices.label.$description,
                            examples: docs.text.choices.label.$examples,
                            ...(this.lenientMode
                                ? {}
                                : {
                                    minLength: 1,
                                    ...(maximumChoiceLabelLength !== undefined
                                        ? { maxLength: maximumChoiceLabelLength }
                                        : {}),
                                }),
                        },
                        description: {
                            type: 'string',
                            title: docs.text.choices.description.$title,
                            description: docs.text.choices.description.$description,
                            examples: docs.text.choices.description.$examples,
                            ...(this.lenientMode
                                ? {}
                                : {
                                    minLength: 1,
                                    ...(maximumChoiceDescriptionLength !== undefined
                                        ? { maxLength: maximumChoiceDescriptionLength }
                                        : {}),
                                }),
                        },
                        default: {
                            type: 'boolean',
                            title: docs.text.choices.default.$title,
                            description: docs.text.choices.default.$description,
                        },
                        position: {
                            type: 'integer',
                            title: docs.text.choices.position.$title,
                            description: docs.text.choices.position.$description,
                            ...(this.lenientMode ? {} : { minimum: 0 }),
                        },
                    },
                    additionalProperties: false,
                },
                ...(this.lenientMode
                    ? {}
                    : {
                        ...(maximumChoiceValueLength !== undefined
                            ? {
                                propertyNames: {
                                    type: 'string',
                                    maxLength: maximumChoiceValueLength,
                                },
                            }
                            : {}),
                        minProperties: 1,
                        ...(maximumChoices !== undefined
                            ? { maxProperties: maximumChoices }
                            : {}),
                    }),
            };
    }
    getListItemLabelSchema(props) {
        const { docs, maximumItemLabelLength } = props;
        return this.features.list?.itemLabel === false
            ? false
            : {
                type: 'string',
                title: docs.list.itemLabel.$title,
                description: docs.list.itemLabel.$description,
                examples: docs.list.itemLabel.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        minLength: 1,
                        ...(maximumItemLabelLength !== undefined
                            ? { maxLength: maximumItemLabelLength }
                            : {}),
                    }),
            };
    }
    getListMinimumLengthSchema(options) {
        const { docs, maximumListLength } = options;
        return this.features.text?.minimumLength === false
            ? false
            : {
                type: 'number',
                title: docs.list.minimumLength.$title,
                description: docs.list.minimumLength.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: 0,
                        maximum: maximumListLength ?? Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getListMaximumLengthSchema(options) {
        const { docs, maximumListLength } = options;
        return this.features.text?.maximumLength === false
            ? false
            : {
                type: 'number',
                title: docs.list.maximumLength.$title,
                description: docs.list.maximumLength.$description,
                ...(this.lenientMode
                    ? {}
                    : {
                        minimum: 0,
                        maximum: maximumListLength ?? Number.MAX_SAFE_INTEGER,
                    }),
            };
    }
    getAttributeLabelSchema(options) {
        const { docs, maximumAttributeLabelLength } = options;
        return this.features.structure?.attributes?.label === false
            ? false
            : {
                type: 'string',
                title: docs.structure.attributes.label.$title,
                description: docs.structure.attributes.label.$description,
                examples: docs.structure.attributes.label.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        minLength: 1,
                        ...(maximumAttributeLabelLength !== undefined
                            ? { maxLength: maximumAttributeLabelLength }
                            : {}),
                    }),
            };
    }
    getAttributeDescriptionSchema(options) {
        const { docs, maximumAttributeDescriptionLength } = options;
        return this.features.structure?.attributes?.description === false
            ? false
            : {
                type: 'string',
                title: docs.structure.attributes.description.$title,
                description: docs.structure.attributes.description.$description,
                examples: docs.structure.attributes.description.$examples,
                ...(this.lenientMode
                    ? {}
                    : {
                        minLength: 1,
                        ...(maximumAttributeDescriptionLength !== undefined
                            ? { maxLength: maximumAttributeDescriptionLength }
                            : {}),
                    }),
            };
    }
    getAttributeOptionalSchema({ docs }) {
        return this.features.structure?.attributes?.optional === false
            ? false
            : {
                type: 'boolean',
                title: docs.structure.attributes.optional.$title,
                description: docs.structure.attributes.optional.$description,
            };
    }
    getAttributePrivateSchema({ docs }) {
        return this.features.structure?.attributes?.private === false
            ? false
            : {
                type: 'boolean',
                title: docs.structure.attributes.private.$title,
                description: docs.structure.attributes.private.$description,
            };
    }
    getAttributePositionSchema({ docs }) {
        return this.features.structure?.attributes?.position === false
            ? false
            : {
                type: 'integer',
                title: docs.structure.attributes.position.$title,
                description: docs.structure.attributes.position.$description,
                ...(this.lenientMode ? {} : { minimum: 0 }),
            };
    }
}
/**
 * Standard schema extended with the extra features supported by the Ajv validator.
 *
 * This extension validates dependent ranges constraints using the `$data` keyword for `minimum`,
 * `minimumLength`, and `minimumLength` to ensure that the lower bound is always less than or
 * equal to the upper bound.
 */
class AjvFeatures extends StandardFeatures {
    getNumberMinimumSchema(options) {
        const schema = super.getNumberMinimumSchema(options);
        if (schema === false || this.features.lenientMode === true || this.features.number?.maximum === false) {
            return schema;
        }
        return {
            allOf: [
                schema,
                {
                    type: 'number',
                    maximum: { $data: '1/maximum' },
                },
            ],
        };
    }
    getTextMinimumLengthSchema(options) {
        const schema = super.getTextMinimumLengthSchema(options);
        if (schema === false || this.features.lenientMode === true || this.features.text?.maximumLength === false) {
            return schema;
        }
        return {
            allOf: [
                schema,
                {
                    type: 'number',
                    maximum: { $data: '1/maximumLength' },
                },
            ],
        };
    }
    getListMinimumLengthSchema(options) {
        const schema = super.getListMinimumLengthSchema(options);
        if (schema === false || this.features.lenientMode === true || this.features.list?.maximumLength === false) {
            return schema;
        }
        return {
            allOf: [
                schema,
                {
                    type: 'number',
                    maximum: { $data: '1/maximumLength' },
                },
            ],
        };
    }
}
/**
 * A JSON schema generator for validating content definitions.
 */
class DefinitionJsonSchemaGenerator {
    /**
     * Construct a new instance.
     *
     * @param configuration The configuration for generating the schema.
     */
    constructor(configuration = {}) {
        const { maximumDepth, references, requiresUnionDiscriminatorPairing, maximumUnionCardinality, } = configuration;
        if (maximumDepth !== undefined) {
            if (maximumDepth < 1) {
                throw new Error('The maximum depth must be greater than or equal to 1.');
            }
            if (references === undefined) {
                throw new Error('The references must be specified for accurate depth calculation.');
            }
        }
        if (requiresUnionDiscriminatorPairing === true && references === undefined) {
            throw new Error('The references must be specified to enforce union discriminator pairing.');
        }
        if (maximumUnionCardinality !== undefined && maximumUnionCardinality < 1) {
            throw new Error('The maximum union cardinality must be greater than or equal to 1.');
        }
        this.configuration = {
            ...configuration,
            docs: configuration.docs ?? DefinitionJsonSchemaGenerator.DEFAULT_DOCS,
        };
        this.features = DefinitionJsonSchemaGenerator.getSchemaFeatures(configuration.extension, configuration.features);
    }
    /**
     * Creates a lenient schema generator.
     *
     * This static factory method configures a generator for generating schemas
     * that validate schemas without strict checking constraints involving empty labels,
     * descriptions, and other properties.
     *
     * @param options The configuration options.
     */
    static lenient(options = {}) {
        // Do not spread the options because it can be any subtype of options and include
        // any of the omitted properties.
        return new DefinitionJsonSchemaGenerator({
            features: {
                ...options.features,
                lenientMode: true,
            },
            references: options.references,
            docs: options.docs,
            extension: options.extension,
        });
    }
    /**
     * Returns the features to support.
     *
     * @param extension The validator-specific features to support.
     * @param features The standard features to support.
     *
     * @returns The features to support.
     */
    static getSchemaFeatures(extension, features) {
        switch (extension) {
            case 'ajv':
                return new AjvFeatures(features);
            default:
                return new StandardFeatures(features);
        }
    }
    /**
     * Generate the JSON schema for validating content definitions.
     *
     * @return The JSON schema in JSON notation.
     */
    generate() {
        return JSON.stringify(this.generateSchema());
    }
    /**
     * Generate the JSON schema for validating content definitions.
     *
     * @return The JSON schema in object form.
     */
    generateSchema() {
        const { maximumDepth, primitiveListItemsOnly } = this.configuration;
        // If the maximum depth is 1, then only empty structure are allowed.
        const definitions = maximumDepth === 1
            ? {}
            : {
                boolean: this.createBooleanSchema(),
                number: this.createNumberSchema(),
                text: this.createTextSchema(),
                ...this.createLogicalTypeSchemas(maximumDepth),
            };
        if (primitiveListItemsOnly === true && maximumDepth !== 1) {
            definitions['list-item'] = this.createSchemaSwitch(definitions);
        }
        if (maximumDepth !== undefined) {
            return {
                ...this.generateRootSchema(maximumDepth),
                $defs: {
                    ...definitions,
                    ...this.generateDepthDefinitions(maximumDepth),
                },
            };
        }
        const reference = this.generateReferenceSchema();
        const unionReference = (!this.isCheckedReferences
            // Reference schemas are inlined when validating discriminator pairing
            || this.configuration.requiresUnionDiscriminatorPairing === true)
            ? false
            : this.generateReferenceSchema(undefined, true);
        const union = this.generateUnionSchema();
        return {
            ...this.generateRootSchema(),
            unevaluatedProperties: false,
            $defs: {
                ...definitions,
                definition: this.generateDefinitionSchema(),
                structure: this.generateStructureSchema(),
                list: this.generateListSchema(),
                ...(union !== false ? { union: union } : {}),
                ...(unionReference !== false ? { 'union-reference': unionReference } : {}),
                ...(reference !== false ? { reference: reference } : {}),
            },
        };
    }
    /**
     * Generates schemas for validating definitions at different depths.
     *
     * @param maximumDepth The maximum depth for generating schemas.
     *
     * @return A map of schemas for validating definitions at different depths.
     */
    generateDepthDefinitions(maximumDepth) {
        const definitions = {};
        for (let currentDepth = 1; currentDepth <= maximumDepth; currentDepth++) {
            const allowedDepth = maximumDepth - (currentDepth - 1);
            const suffix = `-${allowedDepth}`;
            if (currentDepth > 1) {
                definitions[`definition${suffix}`] = this.generateDefinitionSchema(allowedDepth);
            }
            definitions[`structure${suffix}`] = this.generateStructureSchema({
                maximumDepth: allowedDepth,
                rootAnnotations: allowedDepth === maximumDepth,
            });
            if (allowedDepth > 1 && allowedDepth < maximumDepth) {
                definitions[`list${suffix}`] = this.generateListSchema(allowedDepth);
            }
            if (currentDepth > 1) {
                const reference = this.generateReferenceSchema(allowedDepth);
                if (reference !== false) {
                    definitions[`reference${suffix}`] = reference;
                }
            }
            // Reference schemas are inlined when validating discriminator pairing,
            // so no need to generate schemas for them
            if (this.configuration.requiresUnionDiscriminatorPairing !== true) {
                const unionReference = this.generateReferenceSchema(allowedDepth, true);
                if (unionReference !== false) {
                    definitions[`union-reference${suffix}`] = unionReference;
                }
            }
            const union = this.generateUnionSchema({
                maximumDepth: allowedDepth,
                rootAnnotations: allowedDepth === maximumDepth,
            });
            if (union !== false) {
                definitions[`union${suffix}`] = union;
            }
        }
        return definitions;
    }
    /**
     * Generates a schema for validating the root definition.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateRootSchema(maximumDepth) {
        const { rootDefinition, rootAnnotationsOnly = false } = this.configuration;
        const schemas = {};
        if (rootDefinition !== 'union') {
            if (maximumDepth === undefined && rootAnnotationsOnly) {
                schemas.structure = this.generateStructureSchema({ rootAnnotations: true });
            }
            else {
                schemas.structure = maximumDepth !== undefined
                    ? this.getStructureSchema(maximumDepth)
                    : { $ref: '#/$defs/structure' };
            }
        }
        if (rootDefinition !== 'structure') {
            const union = this.getUnionSchema(maximumDepth);
            if (union === false) {
                schemas.union = this.createUnionSchema({ rootAnnotations: true });
            }
            else {
                const rootSchema = maximumDepth === undefined && rootAnnotationsOnly
                    ? this.generateUnionSchema({ rootAnnotations: true })
                    : false;
                schemas.union = rootSchema !== false ? rootSchema : union;
            }
        }
        if (rootDefinition === 'any') {
            schemas.text = this.getTextSchema();
            schemas.number = this.getNumberSchema();
            schemas.boolean = this.getBooleanSchema();
            schemas.list = this.getListSchema(maximumDepth);
            const referenceSchema = this.getReferenceSchema(maximumDepth);
            if (referenceSchema !== false) {
                schemas.reference = referenceSchema;
            }
        }
        const branches = Object.values(schemas);
        return branches.length === 1
            ? { type: 'object', ...branches[0] }
            : this.createSchemaSwitch(schemas);
    }
    /**
     * Returns the schema for validating definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getDefinitionSchema(maximumDepth) {
        return {
            $ref: `#/$defs/definition${maximumDepth !== undefined ? `-${maximumDepth}` : ''}`,
        };
    }
    /**
     * Generates a schema for validating definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateDefinitionSchema(maximumDepth) {
        const schemas = {
            boolean: this.getBooleanSchema(),
            number: this.getNumberSchema(),
            text: this.getTextSchema(),
            structure: this.getStructureSchema(maximumDepth),
        };
        const union = this.getUnionSchema(maximumDepth);
        if (union !== false) {
            schemas.union = union;
        }
        const reference = this.getReferenceSchema(maximumDepth);
        if (reference !== false) {
            schemas.reference = reference;
        }
        if (maximumDepth === undefined || maximumDepth >= 2) {
            schemas.list = this.getListSchema(maximumDepth);
        }
        return this.createSchemaSwitch(schemas);
    }
    /**
     * Returns the schema for validating a boolean definition.
     *
     * @return The schema for validating a boolean definition.
     */
    getBooleanSchema() {
        return {
            $ref: '#/$defs/boolean',
        };
    }
    /**
     * Creates the schema for validating a boolean definition.
     *
     * @return The schema for validating a boolean definition.
     */
    createBooleanSchema() {
        const docs = this.configuration.docs.boolean;
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.type.$title,
                    description: docs.type.$description,
                    const: 'boolean',
                },
                ...this.getNonRootAnnotationProperties(),
                ...DefinitionJsonSchemaGenerator.cleanSchemaProperties({
                    label: this.features.getBooleanLabelSchema(this.configuration),
                    default: this.features.getBooleanDefaultSchema(this.configuration),
                }),
            },
            required: ['type'],
            additionalProperties: false,
        };
    }
    /**
     * Returns the schema for validating a number definition.
     *
     * @return The schema for validating a number definition.
     */
    getNumberSchema() {
        return {
            $ref: '#/$defs/number',
        };
    }
    /**
     * Creates the schema for validating a number definition.
     *
     * @return The schema for validating a number definition.
     */
    createNumberSchema() {
        const { docs } = this.configuration;
        return {
            type: 'object',
            title: docs.number.$title,
            description: docs.number.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.number.type.$title,
                    description: docs.number.type.$description,
                    const: 'number',
                },
                ...this.getNonRootAnnotationProperties(),
                ...DefinitionJsonSchemaGenerator.cleanSchemaProperties({
                    minimum: this.features.getNumberMinimumSchema(this.configuration),
                    maximum: this.features.getNumberMaximumSchema(this.configuration),
                    integer: this.features.getNumberIntegerSchema(this.configuration),
                }),
            },
            required: ['type'],
            additionalProperties: false,
        };
    }
    /**
     * Returns the schema for validating a text definition.
     *
     * @return The schema for validating a text definition.
     */
    getTextSchema() {
        return {
            $ref: '#/$defs/text',
        };
    }
    /**
     * Returns the schemas for validating logical definitions with at most the given depth.
     */
    createLogicalTypeSchemas(maximumDepth) {
        const references = this.getReferences(maximumDepth);
        const referenceMap = this.configuration.references ?? {};
        return Object.fromEntries(references.flatMap(id => {
            const reference = referenceMap[id];
            const logicalSchema = reference.schema;
            if (logicalSchema === undefined) {
                return [];
            }
            const { inheritedProperties = [], ...schema } = logicalSchema;
            const properties = DefinitionJsonSchemaGenerator.cleanSchemaProperties(this.getPropertySchemas(reference.type));
            const inherited = Object.fromEntries(inheritedProperties.flatMap(name => {
                const property = properties[name];
                return property === undefined ? [] : [[name, property]];
            }));
            return [[
                    DefinitionJsonSchemaGenerator.getLogicalTypeRefId(id),
                    {
                        ...schema,
                        properties: { ...inherited, ...schema.properties },
                    },
                ]];
        }));
    }
    /**
     * Creates the schema for validating a text definition.
     *
     * @return The schema for validating a text definition.
     */
    createTextSchema() {
        const { docs, nonConflictingConstraints = false, features: featureFlags } = this.configuration;
        const features = {
            minimumLength: this.features.getTextMinimumLengthSchema(this.configuration),
            maximumLength: this.features.getTextMaximumLengthSchema(this.configuration),
            format: this.features.getTextFormatSchema(this.configuration),
            pattern: this.features.getTextPatternSchema(this.configuration),
            choices: this.features.getTextChoicesSchema(this.configuration),
        };
        const constraints = [];
        if (nonConflictingConstraints) {
            const isMultilineFormatEnabled = features.format !== false
                && featureFlags?.text?.format?.multiline !== false;
            const multilineConstraint = isMultilineFormatEnabled
                ? {
                    format: {
                        type: 'string',
                        enum: ['multiline'],
                    },
                }
                : {};
            if (features.format !== false) {
                constraints.push({
                    properties: { format: features.format },
                    required: ['format'],
                });
            }
            if (features.pattern !== false) {
                constraints.push({
                    properties: {
                        pattern: features.pattern,
                        ...multilineConstraint,
                        ...(features.minimumLength !== false
                            ? { minimumLength: features.minimumLength }
                            : {}),
                        ...(features.maximumLength !== false
                            ? { maximumLength: features.maximumLength }
                            : {}),
                    },
                    required: ['pattern'],
                });
            }
            if (features.choices !== false) {
                constraints.push({
                    properties: { choices: features.choices },
                    required: ['choices'],
                });
            }
            if (features.minimumLength !== false) {
                constraints.push({
                    properties: {
                        minimumLength: features.minimumLength,
                        ...multilineConstraint,
                    },
                    required: ['minimumLength'],
                });
            }
            if (features.maximumLength !== false) {
                constraints.push({
                    properties: {
                        maximumLength: features.maximumLength,
                        ...multilineConstraint,
                    },
                    required: ['maximumLength'],
                });
            }
            if (features.minimumLength !== false && features.maximumLength !== false) {
                constraints.push({
                    properties: {
                        minimumLength: features.minimumLength,
                        maximumLength: features.maximumLength,
                        ...multilineConstraint,
                    },
                    required: ['minimumLength', 'maximumLength'],
                });
            }
        }
        else {
            constraints.push({ properties: DefinitionJsonSchemaGenerator.cleanSchemaProperties(features) });
        }
        const type = {
            type: {
                type: 'string',
                title: docs.text.type.$title,
                description: docs.text.type.$description,
                const: 'text',
            },
        };
        return {
            type: 'object',
            title: docs.text.$title,
            description: docs.text.$description,
            ...(constraints.length === 1
                ? {
                    properties: {
                        ...type,
                        ...this.getNonRootAnnotationProperties(),
                        ...constraints[0].properties,
                    },
                    required: ['type'],
                    additionalProperties: false,
                }
                : {
                    oneOf: [
                        {
                            properties: type,
                            required: ['type'],
                            additionalProperties: false,
                        },
                        ...constraints.map(constraint => ({
                            properties: {
                                ...type,
                                ...this.getNonRootAnnotationProperties(),
                                ...constraint.properties,
                            },
                            required: [...new Set(['type', ...(constraint.required ?? [])])],
                            additionalProperties: false,
                        })),
                    ],
                }),
        };
    }
    getPropertySchemas(type) {
        switch (type) {
            case 'boolean':
                return {
                    label: this.features.getBooleanLabelSchema(this.configuration),
                    default: this.features.getBooleanDefaultSchema(this.configuration),
                };
            case 'number':
                return {
                    minimum: this.features.getNumberMinimumSchema(this.configuration),
                    maximum: this.features.getNumberMaximumSchema(this.configuration),
                    integer: this.features.getNumberIntegerSchema(this.configuration),
                };
            case 'text':
                return this.getTextSchemaProperties();
            case 'list':
                return {
                    itemLabel: this.features.getListItemLabelSchema(this.configuration),
                    minimumLength: this.features.getListMinimumLengthSchema(this.configuration),
                    maximumLength: this.features.getListMaximumLengthSchema(this.configuration),
                };
            default:
                return {};
        }
    }
    getTextSchemaProperties() {
        return {
            minimumLength: this.features.getTextMinimumLengthSchema(this.configuration),
            maximumLength: this.features.getTextMaximumLengthSchema(this.configuration),
            format: this.features.getTextFormatSchema(this.configuration),
            pattern: this.features.getTextPatternSchema(this.configuration),
            choices: this.features.getTextChoicesSchema(this.configuration),
        };
    }
    /**
     * Returns the schema for validating list definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getListSchema(maximumDepth) {
        return {
            $ref: `#/$defs/list${maximumDepth !== undefined ? `-${maximumDepth}` : ''}`,
        };
    }
    /**
     * Generates a schema for validating list definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateListSchema(maximumDepth) {
        const { docs } = this.configuration;
        const features = {
            itemLabel: this.features.getListItemLabelSchema(this.configuration),
            minimumLength: this.features.getListMinimumLengthSchema(this.configuration),
            maximumLength: this.features.getListMaximumLengthSchema(this.configuration),
        };
        return {
            type: 'object',
            title: docs.list.$title,
            description: docs.list.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.list.type.$title,
                    description: docs.list.type.$description,
                    const: 'list',
                },
                ...this.getNonRootAnnotationProperties(),
                items: {
                    title: docs.list.items.$title,
                    description: docs.list.items.$description,
                    ...this.getListItemSchema(maximumDepth !== undefined ? maximumDepth - 1 : undefined),
                },
                ...DefinitionJsonSchemaGenerator.cleanSchemaProperties(features),
            },
            required: ['type', 'items'],
            additionalProperties: false,
        };
    }
    /**
     * Returns the schema for validating list items with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getListItemSchema(maximumDepth) {
        if (this.configuration.primitiveListItemsOnly !== true) {
            return this.getDefinitionSchema(maximumDepth);
        }
        // The depth is irrelevant for primitive list items
        return {
            $ref: '#/$defs/list-item',
        };
    }
    /**
     * Returns the schema for validating structure definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getStructureSchema(maximumDepth) {
        return {
            $ref: `#/$defs/structure${maximumDepth !== undefined ? `-${maximumDepth}` : ''}`,
        };
    }
    /**
     * Generates a schema for validating structure definitions with at most the given depth.
     *
     * @param options The options for generating the schema.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateStructureSchema(options = {}) {
        const { maximumDepth, rootAnnotations = false } = options;
        const { attributeNamePattern, minimumAttributeNameLength, maximumAttributeNameLength, maximumAttributesPerStructure, nonEmptyStructure = false, docs, } = this.configuration;
        return {
            type: 'object',
            title: docs.structure.$title,
            description: docs.structure.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.structure.type.$title,
                    description: docs.structure.type.$description,
                    const: 'structure',
                },
                ...(rootAnnotations
                    ? this.getAnnotationProperties()
                    : this.getNonRootAnnotationProperties()),
                attributes: {
                    type: 'object',
                    title: docs.structure.attributes.$title,
                    description: docs.structure.attributes.$description,
                    ...(this.features.lenientMode
                        ? {}
                        : {
                            propertyNames: {
                                type: 'string',
                                ...(minimumAttributeNameLength !== undefined
                                    ? { minLength: minimumAttributeNameLength }
                                    : {}),
                                ...(maximumAttributeNameLength !== undefined
                                    ? { maxLength: maximumAttributeNameLength }
                                    : {}),
                                ...(attributeNamePattern !== undefined
                                    ? { pattern: attributeNamePattern }
                                    : {}),
                            },
                        }),
                    ...(nonEmptyStructure ? { minProperties: 1 } : {}),
                    ...(maximumAttributesPerStructure !== undefined
                        ? { maxProperties: maximumAttributesPerStructure }
                        : {}),
                    additionalProperties: maximumDepth !== undefined && maximumDepth < 2
                        ? false
                        : {
                            type: 'object',
                            properties: {
                                type: this.getDefinitionSchema(maximumDepth !== undefined ? maximumDepth - 1 : undefined),
                                ...DefinitionJsonSchemaGenerator.cleanSchemaProperties({
                                    label: this.features.getAttributeLabelSchema(this.configuration),
                                    description: this.features.getAttributeDescriptionSchema(this.configuration),
                                    optional: this.features.getAttributeOptionalSchema(this.configuration),
                                    private: this.features.getAttributePrivateSchema(this.configuration),
                                    position: this.features.getAttributePositionSchema(this.configuration),
                                }),
                            },
                            required: ['type'],
                            additionalProperties: false,
                        },
                },
            },
            required: ['type', 'attributes'],
            additionalProperties: false,
        };
    }
    /**
     * Returns the schema for validating union definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getUnionSchema(maximumDepth) {
        const references = this.getReferences(maximumDepth, true);
        if (references.length === 0
            && this.configuration.unionReferenceOnly === true
            && this.configuration.references !== undefined) {
            return false;
        }
        return {
            $ref: `#/$defs/union${maximumDepth !== undefined ? `-${maximumDepth}` : ''}`,
        };
    }
    /**
     * Returns the schema for validating union definitions with at most the given depth.
     *
     * @param options The options for generating the schema.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateUnionSchema(options = {}) {
        const { maximumDepth, rootAnnotations = false } = options;
        const { unionReferenceOnly = false, references: referenceMap } = this.configuration;
        const references = this.getReferences(maximumDepth, true);
        if (referenceMap !== undefined && references.length === 0 && unionReferenceOnly) {
            return false;
        }
        const { requiresUnionDiscriminatorPairing = false } = this.configuration;
        if (requiresUnionDiscriminatorPairing) {
            return this.createUnionSchema({
                types: Object.fromEntries(references.map(id => [
                    id,
                    unionReferenceOnly
                        ? this.createReferenceSchema([id])
                        : this.createSchemaSwitch({
                            structure: this.getStructureSchema(maximumDepth),
                            reference: this.createReferenceSchema([id]),
                        }),
                ])),
                additionalTypes: unionReferenceOnly ? false : this.getStructureSchema(maximumDepth),
                rootAnnotations: rootAnnotations,
            });
        }
        const referenceSchema = this.getReferenceSchema(maximumDepth, true);
        if (unionReferenceOnly) {
            return this.createUnionSchema({
                additionalTypes: referenceSchema,
                rootAnnotations: rootAnnotations,
            });
        }
        return this.createUnionSchema({
            additionalTypes: referenceSchema === false
                ? this.getStructureSchema(maximumDepth)
                : this.createSchemaSwitch({
                    structure: this.getStructureSchema(maximumDepth),
                    reference: referenceSchema,
                }),
            rootAnnotations: rootAnnotations,
        });
    }
    /**
     * Creates a union schema.
     *
     * @param options The options for creating the union schema.
     *
     * @return The union schema.
     */
    createUnionSchema(options = {}) {
        const { types, additionalTypes = false, rootAnnotations = false } = options;
        const { unionDiscriminatorPattern, maximumUnionCardinality } = this.configuration;
        const docs = this.configuration.docs.union;
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.type.$title,
                    description: docs.type.$description,
                    const: 'union',
                },
                ...(rootAnnotations ? this.getAnnotationProperties() : this.getNonRootAnnotationProperties()),
                types: {
                    type: 'object',
                    title: docs.types.$title,
                    description: docs.types.$description,
                    ...(types !== undefined ? { properties: types } : {}),
                    additionalProperties: additionalTypes,
                    ...(this.features.lenientMode
                        ? {}
                        : {
                            minProperties: 2,
                            propertyNames: {
                                type: 'string',
                                minLength: 1,
                                // When types !== undefined && additionalTypes === false, this could be
                                // removed as an optimization. However, keeping it provides a way to ensure
                                // the discriminator matches the required pattern from a certain
                                // point forward (i.e., a bug that allowed invalid identifiers previously)
                                ...(unionDiscriminatorPattern !== undefined
                                    ? { pattern: unionDiscriminatorPattern }
                                    : {}),
                            },
                            ...(maximumUnionCardinality !== undefined
                                ? { maxProperties: maximumUnionCardinality }
                                : {}),
                        }),
                },
            },
            required: ['type', 'types'],
            additionalProperties: false,
        };
    }
    /**
     * Returns the schema for validating reference definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     * @param unionMember Whether to only include references that are valid union members.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    getReferenceSchema(maximumDepth, unionMember = false) {
        if (this.isCheckedReferences) {
            const references = this.getReferences(maximumDepth, unionMember);
            if (references.length === 0) {
                return false;
            }
        }
        return {
            $ref: `#/$defs/${this.isCheckedReferences && unionMember ? 'union-' : ''}`
                + `reference${maximumDepth !== undefined ? `-${maximumDepth}` : ''}`,
        };
    }
    /**
     * Generates a schema for validating reference definitions with at most the given depth.
     *
     * @param maximumDepth The maximum depth that the schema should allow.
     * @param unionMember Whether to only include references that are valid union members.
     *
     * @return If a maximum depth is specified, the schema for validating definitions with at most
     * the given depth; otherwise, a schema that allows any depth.
     */
    generateReferenceSchema(maximumDepth, unionMember) {
        const references = this.getReferences(maximumDepth, unionMember);
        if (this.isCheckedReferences && references.length === 0) {
            return false;
        }
        return this.createReferenceSchema(references);
    }
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
    createReferenceSchema(references) {
        const docs = this.configuration.docs.reference;
        const logicalDefinitions = references.filter(id => this.configuration.references?.[id].schema !== undefined);
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.type.$title,
                    description: docs.type.$description,
                    const: 'reference',
                },
                ...this.getNonRootAnnotationProperties(),
                id: {
                    type: 'string',
                    title: docs.id.$title,
                    description: docs.id.$description,
                    ...(this.features.lenientMode
                        ? {}
                        : {
                            minLength: 1,
                            ...(this.isCheckedReferences ? { enum: references } : {}),
                        }),
                },
                ...(logicalDefinitions.length === 0
                    // Allow arbitrary `properties` field when not validating references
                    ? {
                        properties: {
                            type: 'object',
                            additionalProperties: this.configuration.references === undefined,
                        },
                    }
                    : {}),
            },
            ...(logicalDefinitions.length > 0
                ? {
                    allOf: [
                        {
                            if: {
                                properties: {
                                    id: {
                                        type: 'string',
                                        enum: logicalDefinitions,
                                    },
                                },
                            },
                            else: {
                                properties: {
                                    properties: {
                                        type: 'object',
                                        additionalProperties: false,
                                    },
                                },
                            },
                        },
                        ...logicalDefinitions.map(type => ({
                            if: {
                                properties: {
                                    id: {
                                        const: type,
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    properties: {
                                        type: 'object',
                                        unevaluatedProperties: false,
                                        $ref: `#/$defs/${DefinitionJsonSchemaGenerator.getLogicalTypeRefId(type)}`,
                                    },
                                },
                                required: this.configuration.references?.[type].fullyOptional === true
                                    ? []
                                    : ['properties'],
                            },
                        })),
                    ],
                }
                : {}),
            required: ['type', 'id'],
            unevaluatedProperties: false,
        };
    }
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
    getReferences(maximumDepth, unionMember = false) {
        const ids = [];
        for (const [id, { depth, type }] of Object.entries(this.configuration.references ?? {})) {
            if ((maximumDepth === undefined || depth <= maximumDepth)
                && (!unionMember || type === 'structure')) {
                ids.push(id);
            }
        }
        return ids;
    }
    getNonRootAnnotationProperties() {
        if (this.configuration.rootAnnotationsOnly === true) {
            return {};
        }
        return this.getAnnotationProperties();
    }
    getAnnotationProperties() {
        return DefinitionJsonSchemaGenerator.cleanSchemaProperties({
            title: this.features.getTitleSchema(this.configuration),
            description: this.features.getDescriptionSchema(this.configuration),
        });
    }
    /**
     * Creates a switch definition schema.
     *
     * @param branches The branches of the switch.
     *
     * @return The switch definition schema.
     */
    createSchemaSwitch(branches) {
        const docs = this.configuration.docs.definition;
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    title: docs.type.$title,
                    description: docs.type.$description,
                    enum: Object.keys(branches),
                },
            },
            allOf: Object.entries(branches).map(([id, schema]) => ({
                if: {
                    properties: {
                        type: {
                            const: id,
                        },
                    },
                },
                then: schema,
            })),
            required: ['type'],
            unevaluatedProperties: false,
        };
    }
    get isCheckedReferences() {
        return !this.features.lenientMode && this.configuration.references !== undefined;
    }
    /**
     * Remove all properties from the given map that matches nothing.
     *
     * @param properties The map of properties.
     *
     * @return The map of properties whose schema is not `false`.
     */
    static cleanSchemaProperties(properties) {
        const cleanedProperties = {};
        for (const [name, property] of Object.entries(properties)) {
            if (property !== false) {
                cleanedProperties[name] = property;
            }
        }
        return cleanedProperties;
    }
    static getLogicalTypeRefId(type) {
        const readableName = type.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
            .replace(/[^a-z0-9]+/gi, '-');
        const hash = DefinitionJsonSchemaGenerator.getLogicalTypeCode(type);
        return `logical-reference-${readableName}-${hash}`;
    }
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
    static getLogicalTypeCode(id) {
        let hash = 0;
        for (let index = 0; index < id.length; index++) {
            // The resulting hash must be always positive
            // to avoid minus sign in the identifier.
            // The bitwise AND operation with 0x7FFFFFFF
            // forces the result to be an always positive
            // 32-bit signed integer by wrapping the result
            // around the maximum value and dropping any leading bits.
            hash = (hash * 31 + id.charCodeAt(index)) & 0x7FFFFFFF;
        }
        return hash.toString(16);
    }
}
exports.DefinitionJsonSchemaGenerator = DefinitionJsonSchemaGenerator;
/**
 * The default documentation.
 */
DefinitionJsonSchemaGenerator.DEFAULT_DOCS = {
    definition: {
        $title: 'Definition',
        $description: 'The definition of a value.',
        type: {
            $title: 'Type',
            $description: 'The type of the value.',
        },
        title: {
            $title: 'Title',
            $description: 'A title that identifies the definition.',
            $examples: ['Home banner', 'Discount flag', 'Palette'],
        },
        description: {
            $title: 'Description',
            $description: 'A brief description of the definition.',
            $examples: [
                'The banner that appears on the home page.',
                'The flag that species whether a product is on sale.',
                'The colors allowed in the design system.',
            ],
        },
    },
    boolean: {
        $title: 'Boolean definition',
        $description: 'The definition of a boolean value.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        label: {
            $title: 'Label',
            $description: 'The label to display for the input on the user interface.',
            true: {
                $title: 'Label for true',
                $description: 'The label to display for the input when the value is true.',
                $examples: [
                    'On',
                    'Enabled',
                    'Visible',
                ],
            },
            false: {
                $title: 'Label for false',
                $description: 'The label to display for the input when the value is false.',
                $examples: [
                    'Off',
                    'Disabled',
                    'Hidden',
                ],
            },
        },
        default: {
            $title: 'Default value',
            $description: 'The value to be preselected on the user interface.',
        },
    },
    number: {
        $title: 'Number definition',
        $description: 'The definition of a numeric value.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        integer: {
            $title: 'Integer only?',
            $description: 'Whether to allow only whole values.',
        },
        minimum: {
            $title: 'Minimum',
            $description: 'The minimum allowed value.',
        },
        maximum: {
            $title: 'Maximum',
            $description: 'The maximum allowed value.',
        },
    },
    text: {
        $title: 'Text definition',
        $description: 'The definition of a text value.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        minimumLength: {
            $title: 'Minimum length',
            $description: 'The minimum allowed length.',
        },
        maximumLength: {
            $title: 'Maximum length',
            $description: 'The maximum allowed length.',
        },
        format: {
            $title: 'Format',
            $description: 'The pre-defined format that the text must match.',
        },
        pattern: {
            $title: 'Pattern',
            $description: 'The pattern that the text must match.',
            $examples: ['^[A-Z]', '[0-9]{3}'],
        },
        choices: {
            $title: 'Choices',
            $description: 'The map of the allowed choices.',
            label: {
                $title: 'Label',
                $description: 'The label to display for the choice on the user interface.',
                $examples: ['Red', 'Blue', 'Left', 'Bottom'],
            },
            description: {
                $title: 'Description',
                $description: 'The description to display for the choice on the user interface.',
                $examples: [
                    'The hex code for the color red is #FF0000.',
                    'Recommended for users with color blindness.',
                ],
            },
            default: {
                $title: 'Default',
                $description: 'Whether the choice is the default.',
            },
            position: {
                $title: 'Position',
                $description: 'The position of the choice in the list.',
            },
        },
    },
    list: {
        $title: 'List definition',
        $description: 'The definition of a list of values.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        items: {
            $title: 'Items',
            $description: 'The definition of the items in the list.',
        },
        itemLabel: {
            $title: 'Item label',
            $description: 'A label to prefix each item in the list in the user interface.',
            $examples: ['Item', 'Tag', 'Link', 'Card'],
        },
        minimumLength: {
            $title: 'Minimum items',
            $description: 'The minimum required number of items.',
        },
        maximumLength: {
            $title: 'Maximum items',
            $description: 'The maximum allowed number of items.',
        },
    },
    structure: {
        $title: 'Structure definition',
        $description: 'The definition of a structured value.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        attributes: {
            $title: 'Attributes',
            $description: 'The definition of the attributes in the structure.',
            label: {
                $title: 'Label',
                $description: 'The label to display for the attribute on the user interface.',
                $examples: ['Title', 'Call to action', 'Headline'],
            },
            description: {
                $title: 'Description',
                $description: 'The description to display for the attribute on '
                    + 'the user interface.',
                $examples: [
                    'The hero\'s title.',
                    'The call-to-action label.',
                    'The headline of the page.',
                ],
            },
            optional: {
                $title: 'Optional?',
                $description: 'Whether the attribute can be omitted.',
            },
            private: {
                $title: 'Private?',
                $description: 'Whether the attribute is for internal use only '
                    + 'and should not be exposed through the API.',
            },
            position: {
                $title: 'Position',
                $description: 'The order in which the attribute should be displayed.',
            },
        },
    },
    union: {
        $title: 'Union definition',
        $description: 'The definition of a value that can take multiple forms.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        types: {
            $title: 'Types',
            $description: 'The map of discriminators to definitions.',
        },
    },
    reference: {
        $title: 'Reference definition',
        $description: 'The definition of a reference to another definition.',
        type: {
            $title: 'Type',
            $description: 'The data type.',
        },
        id: {
            $title: 'Definition ID',
            $description: 'The ID of the referenced definition.',
        },
    },
};
