"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentJsonSchemaGenerator = void 0;
const content_1 = require("../../content");
const definition_1 = require("../../definition");
const utils_1 = require("../../utils");
var Dispatcher = definition_1.ContentDefinition.Dispatcher;
/**
 * A JSON schema generator.
 *
 * This visitor is stateful and should be used only once per resolution – reason why it is
 * not exported.
 */
class ContentJsonSchemaVisitor extends Dispatcher {
    constructor(configuration) {
        super();
        this.referencedDefinitions = new Map();
        this.configuration = {
            docs: configuration.docs ?? ContentJsonSchemaVisitor.DEFAULT_DOCS,
            inlinePrimitives: configuration.inlinePrimitives ?? false,
            relaxDynamicTextConstraints: configuration.relaxDynamicTextConstraints ?? false,
            allowDynamicValues: configuration.allowDynamicValues ?? {},
            maximumStringLength: configuration.maximumStringLength,
            maximumListLength: configuration.maximumListLength,
            maximumListItemLabelLength: configuration.maximumListItemLabelLength,
            includeExpressionType: configuration.includeExpressionType ?? false,
        };
    }
    getReferencedDefinitions() {
        return Object.fromEntries(this.referencedDefinitions.entries());
    }
    visitBoolean(_, __, options = {}) {
        return this.getPrimitiveValueSchema('boolean', options);
    }
    visitNumber(definition, _, options = {}) {
        const hasConstraints = definition.maximum !== undefined
            || definition.minimum !== undefined
            || definition.integer === true;
        if (!hasConstraints) {
            return this.getPrimitiveValueSchema('number', options);
        }
        const docs = this.configuration.docs.primitive;
        const valueSchema = {
            type: definition.integer === true ? 'integer' : 'number',
            ...(0, utils_1.clean)({
                minimum: definition.minimum,
                maximum: definition.maximum,
            }),
        };
        const rules = this.configuration.allowDynamicValues.number ?? {};
        const allowsDynamicValue = (definition.maximum === undefined || rules.maximum === true)
            && (definition.minimum === undefined || rules.minimum === true)
            && (definition.integer !== true || rules.integer === true);
        if (allowsDynamicValue) {
            return this.getPrimitiveValueInlineSchema('number', options, valueSchema);
        }
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    const: 'number',
                    title: docs.type.$title,
                    description: docs.type.$description,
                },
                value: {
                    type: 'object',
                    title: docs.value.$title,
                    description: docs.value.$description,
                    properties: {
                        type: {
                            type: 'string',
                            const: 'static',
                            title: docs.value.type.$title,
                            description: docs.value.type.$description,
                        },
                        value: {
                            title: docs.value.static.value.$title,
                            description: docs.value.static.value.$description,
                            ...valueSchema,
                        },
                    },
                    additionalProperties: false,
                    required: ['type', 'value'],
                },
            },
            required: ['type', 'value'],
        };
    }
    visitText(definition, _, options = {}) {
        const hasConstraints = definition.minimumLength !== undefined
            || definition.maximumLength !== undefined
            || definition.pattern !== undefined
            || definition.format !== undefined
            || definition.choices !== undefined;
        if (!hasConstraints) {
            return this.getPrimitiveValueSchema('text', options);
        }
        const docs = this.configuration.docs.primitive;
        const maxLength = this.getTextMaxLength(definition.format, definition.maximumLength);
        const minLength = definition.minimumLength !== undefined
            ? Math.min(definition.minimumLength, maxLength ?? definition.minimumLength)
            : undefined;
        const valueSchema = {
            type: 'string',
            ...(0, utils_1.clean)({
                maxLength: maxLength,
                minLength: minLength,
                format: definition.format,
                pattern: definition.pattern,
                enum: definition.choices !== undefined
                    ? Object.keys(definition.choices)
                    : undefined,
            }),
        };
        const rules = this.configuration.allowDynamicValues.text ?? {};
        const allowsDynamicValue = (definition.minimumLength === undefined || rules.minimumLength === true)
            && (definition.maximumLength === undefined || rules.maximumLength === true)
            && (definition.pattern === undefined || rules.pattern === true)
            && (definition.format === undefined || rules.format === true)
            && (definition.choices === undefined || rules.choices === true);
        if (allowsDynamicValue) {
            return this.getPrimitiveValueInlineSchema('text', options, valueSchema);
        }
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    const: 'text',
                    title: docs.type.$title,
                    description: docs.type.$description,
                },
                value: {
                    type: 'object',
                    title: docs.value.$title,
                    description: docs.value.$description,
                    properties: {
                        type: {
                            type: 'string',
                            const: 'static',
                            title: docs.value.type.$title,
                            description: docs.value.type.$description,
                        },
                        value: {
                            title: docs.value.static.value.$title,
                            description: docs.value.static.value.$description,
                            ...valueSchema,
                        },
                    },
                    additionalProperties: false,
                    required: ['type', 'value'],
                },
            },
            required: ['type', 'value'],
        };
    }
    visitList(definition, path) {
        const docs = this.configuration.docs.list;
        const maxLengthCap = this.configuration.maximumListLength;
        const maxLength = definition.maximumLength !== undefined
            ? Math.min(definition.maximumLength, maxLengthCap ?? definition.maximumLength)
            : maxLengthCap;
        const minLength = definition.minimumLength !== undefined
            ? Math.min(definition.minimumLength, maxLength ?? definition.minimumLength)
            : undefined;
        return {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    const: 'list',
                },
                items: {
                    type: 'array',
                    title: docs.values.$title,
                    description: docs.values.$description,
                    items: this.visitListItem(definition.items, path.joinedWith(['-'])),
                    ...(0, utils_1.clean)({
                        maxItems: maxLength,
                        minItems: minLength,
                    }),
                },
            },
            additionalProperties: false,
            required: ['type', 'items'],
        };
    }
    visitUnion(definition, path) {
        return {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    enum: Object.keys(definition.types),
                },
            },
            allOf: Object.entries(definition.types).map(([discriminator, subtype]) => ({
                if: {
                    properties: {
                        name: {
                            const: discriminator,
                        },
                    },
                },
                then: subtype.type === 'structure'
                    ? this.visitStructure(subtype, path, true)
                    : this.visitReference(subtype),
            })),
            unevaluatedProperties: false,
            required: ['name'],
        };
    }
    visitStructure(definition, path, allowAdditionalProperties = false) {
        const attributes = {};
        const required = [];
        const docs = this.configuration.docs.structure;
        for (const [name, attribute] of Object.entries(definition.attributes)) {
            attributes[name] = {
                title: docs.attributes.attribute.$title,
                description: docs.attributes.attribute.$description,
                ...this.visitAttribute(attribute, path.joinedWith([name])),
                ...(0, utils_1.clean)({
                    title: attribute.label,
                    description: attribute.description,
                }),
            };
            if (attribute.optional !== true) {
                required.push(name);
            }
        }
        return {
            type: 'object',
            title: definition.title ?? docs.$title,
            description: definition.description ?? docs.$description,
            properties: {
                type: {
                    const: 'structure',
                },
                attributes: {
                    type: 'object',
                    title: docs.attributes.$title,
                    description: docs.attributes.$description,
                    ...(Object.keys(attributes).length > 0 ? { properties: attributes } : null),
                    ...(required.length > 0 ? { required: required } : null),
                    additionalProperties: false,
                },
            },
            required: ['type', 'attributes'],
            ...(allowAdditionalProperties ? {} : { additionalProperties: false }),
        };
    }
    visitReference(definition) {
        return {
            $ref: `#/$defs/external/${ContentJsonSchemaVisitor.getReferenceRefId(definition.id)}`,
        };
    }
    visitAttribute(definition, path) {
        if (definition.optional !== true) {
            return this.visit(definition.type, path);
        }
        const attributeType = definition.type;
        switch (attributeType.type) {
            case 'boolean':
                return this.visitBoolean(attributeType, path, {
                    nullable: true,
                });
            case 'number':
                return this.visitNumber(attributeType, path, {
                    nullable: true,
                });
            case 'text':
                return this.visitText(attributeType, path, {
                    nullable: true,
                });
            default:
                return this.visit(attributeType, path);
        }
    }
    visitListItem(definition, path) {
        switch (definition.type) {
            case 'boolean':
                return this.visitBoolean(definition, path, {
                    listItem: true,
                });
            case 'number':
                return this.visitNumber(definition, path, {
                    listItem: true,
                });
            case 'text':
                return this.visitText(definition, path, {
                    listItem: true,
                });
        }
        return this.createListItemSchema(this.visit(definition, path));
    }
    /**
     * Returns the JSON schema for a primitive value.
     *
     * @param type The primitive value type.
     * @param options The primitive value options.
     *
     * @returns The primitive schema or reference depending on the inlining option.
     */
    getPrimitiveValueSchema(type, options = {}) {
        return this.configuration.inlinePrimitives
            ? this.getPrimitiveValueInlineSchema(type, options)
            : this.getPrimitiveValueReference(type, options);
    }
    /**
     * Returns the JSON schema reference for a primitive value.
     *
     * @param type The primitive value type.
     * @param options The primitive value options.
     *
     * @returns The primitive schema reference.
     */
    getPrimitiveValueReference(type, options = {}) {
        const idPrefix = (options.listItem === true ? 'list-item-' : '')
            + (options.nullable === true ? 'nullable-' : '');
        const id = `${idPrefix}${type}`;
        if (!this.referencedDefinitions.has(id)) {
            this.referencedDefinitions.set(id, this.getPrimitiveValueInlineSchema(type, options));
        }
        return {
            $ref: `#/$defs/internal/${id}`,
        };
    }
    /**
     * Returns the JSON schema for a primitive value.
     *
     * @param type The primitive value type.
     * @param options The primitive value options.
     * @param schema The JSON type of the primitive value.
     *
     * @returns The primitive schema.
     */
    getPrimitiveValueInlineSchema(type, options = {}, schema = {}) {
        const docs = this.configuration.docs.primitive;
        const { type: typeName, ...valueSchema } = this.getPrimitiveDefaultValueSchema(type, schema);
        const relaxDynamicTextConstraints = this.configuration.relaxDynamicTextConstraints && type === 'text';
        const isNullable = options.nullable === true;
        const isListItem = options.listItem === true;
        const primitiveSchema = {
            type: 'object',
            title: docs.$title,
            description: docs.$description,
            properties: {
                type: {
                    type: 'string',
                    const: type,
                    title: docs.type.$title,
                    description: docs.type.$description,
                },
                value: {
                    type: 'object',
                    title: docs.value.$title,
                    description: docs.value.$description,
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['static', 'dynamic'],
                            title: docs.value.type.$title,
                            description: docs.value.type.$description,
                        },
                    },
                    allOf: [
                        {
                            type: 'object',
                            if: {
                                properties: {
                                    type: {
                                        type: 'string',
                                        const: 'static',
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    value: {
                                        type: typeName,
                                        title: docs.value.static.value.$title,
                                        description: docs.value.static.value.$description,
                                        ...(relaxDynamicTextConstraints
                                            ? {
                                                if: {
                                                    pattern: content_1.Placeholder.PATTERN.source,
                                                },
                                                then: true,
                                                else: valueSchema,
                                            }
                                            : valueSchema),
                                    },
                                },
                                required: ['value'],
                            },
                        },
                        {
                            type: 'object',
                            if: {
                                properties: {
                                    type: {
                                        type: 'string',
                                        const: 'dynamic',
                                    },
                                },
                            },
                            then: {
                                properties: {
                                    nullable: {
                                        type: 'boolean',
                                        const: isNullable,
                                        title: docs.value.dynamic.nullable.$title,
                                        description: docs.value.dynamic.nullable.$description,
                                    },
                                    expression: {
                                        type: 'string',
                                        title: docs.value.dynamic.expression.$title,
                                        description: docs.value.dynamic.expression.$description,
                                        ...(this.configuration.includeExpressionType
                                            ? {
                                                result: {
                                                    type: type,
                                                    nullable: isNullable,
                                                },
                                            }
                                            : {}),
                                    },
                                    default: {
                                        type: isNullable ? ['null', typeName] : typeName,
                                        title: docs.value.dynamic.default.$title,
                                        description: docs.value.dynamic.default.$description,
                                        ...(relaxDynamicTextConstraints
                                            ? {
                                                if: {
                                                    pattern: content_1.Placeholder.PATTERN.source,
                                                },
                                                then: true,
                                                else: valueSchema,
                                            }
                                            : valueSchema),
                                    },
                                },
                                required: [
                                    'expression',
                                    isNullable ? 'nullable' : 'default',
                                ],
                            },
                        },
                    ],
                    required: ['type'],
                    unevaluatedProperties: false,
                },
            },
            required: ['type', 'value'],
            additionalProperties: false,
        };
        return isListItem ? this.createListItemSchema(primitiveSchema) : primitiveSchema;
    }
    getPrimitiveDefaultValueSchema(type, schema) {
        switch (type) {
            case 'text':
                return this.getTextDefaultValueSchema(schema);
            case 'number':
                return this.getNumberDefaultValueSchema(schema);
            case 'boolean':
                return this.getBooleanDefaultValueSchema(schema);
        }
    }
    getTextDefaultValueSchema(schema) {
        const textSchema = {
            type: schema.type ?? 'string',
            ...schema,
        };
        const maxLength = this.getTextMaxLength(textSchema.format, textSchema.maxLength);
        if (maxLength !== undefined) {
            textSchema.maxLength = maxLength;
        }
        return textSchema;
    }
    getNumberDefaultValueSchema(schema) {
        const numberSchema = {
            type: schema.type ?? 'number',
            ...schema,
        };
        if (numberSchema.minimum === undefined) {
            numberSchema.minimum = Number.MIN_SAFE_INTEGER;
        }
        if (numberSchema.maximum === undefined) {
            numberSchema.maximum = Number.MAX_SAFE_INTEGER;
        }
        return numberSchema;
    }
    getBooleanDefaultValueSchema(schema) {
        return {
            type: schema.type ?? 'boolean',
            ...schema,
        };
    }
    static getReferenceRefId(referenceId) {
        const readableName = referenceId.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
            .replace(/[^a-z0-9]+/gi, '-');
        const hash = this.getReferenceIdHash(referenceId);
        return `${readableName}-${hash}`;
    }
    /**
     * Returns a hash for a reference ID.
     *
     * The purpose of this hash is to act as a seed and decrease the
     * likelihood of collisions among identifiers for reference ID.
     *
     * Although the result is not guaranteed to be unique for different types,
     * but the collision probability is low enough for practical purposes.
     *
     * @param id The reference ID.
     */
    static getReferenceIdHash(id) {
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
    getTextMaxLength(format, maxLength) {
        const formatMaxLength = this.getTextFormatMaxLength(format);
        if (formatMaxLength !== undefined) {
            return maxLength !== undefined
                ? Math.min(maxLength, formatMaxLength)
                : formatMaxLength;
        }
        const { maximumStringLength } = this.configuration;
        if (maxLength !== undefined && maximumStringLength !== undefined) {
            return Math.min(maxLength, maximumStringLength.default);
        }
        return maxLength ?? maximumStringLength?.default;
    }
    getTextFormatMaxLength(format) {
        const { maximumStringLength } = this.configuration;
        if (maximumStringLength === undefined) {
            return undefined;
        }
        switch (format) {
            case 'multiline':
                return maximumStringLength.multiline;
            case 'url':
                return maximumStringLength.url;
            default:
                return undefined;
        }
    }
    createListItemSchema(itemSchema) {
        return {
            ...itemSchema,
            properties: {
                ...itemSchema.properties,
                label: {
                    type: 'string',
                    title: this.configuration.docs.list.label.$title,
                    description: this.configuration.docs.list.label.$description,
                    ...(this.configuration.maximumListItemLabelLength !== undefined
                        ? {
                            maxLength: this.configuration.maximumListItemLabelLength,
                        }
                        : {}),
                },
            },
        };
    }
}
/**
 * The default documentation.
 */
ContentJsonSchemaVisitor.DEFAULT_DOCS = {
    primitive: {
        $title: 'Value definition',
        $description: 'Defines the data type and value.',
        type: {
            $title: 'Data type',
            $description: 'The data type of the resolved value.',
        },
        value: {
            $title: 'Value',
            $description: 'Defines how to resolve the value.',
            type: {
                $title: 'Value type',
                $description: 'Defines whether the value is static or dynamically resolved at runtime.',
            },
            static: {
                value: {
                    $title: 'Static value',
                    $description: 'The resolved value.',
                },
            },
            dynamic: {
                expression: {
                    $title: 'Expression',
                    $description: 'A CQL expression that resolves to the value.',
                },
                nullable: {
                    $title: 'Nullable?',
                    $description: 'Whether the expression result is nullable.',
                },
                default: {
                    $title: 'Default',
                    $description: 'A static value used in case the expression evaluation '
                        + 'fails, results in null, or yields a value of unexpected type.',
                },
            },
        },
    },
    list: {
        $title: 'List',
        $description: 'A list of values.',
        values: {
            $title: 'Values',
            $description: 'The list of values.',
        },
        label: {
            $title: 'Label',
            $description: 'The label of the item.',
        },
    },
    structure: {
        $title: 'Structure',
        $description: 'A set of attributes as key-value pairs.',
        attributes: {
            $title: 'Attributes',
            $description: 'The structure-specific attributes.',
            attribute: {
                $title: 'Attribute value',
                $description: 'The attribute value.',
            },
        },
    },
};
/**
 * A content JSON schema generator.
 *
 * This generator can generate JSON schemas for validating a content against a definition.
 */
class ContentJsonSchemaGenerator {
    /**
     * Constructs a new instance.
     *
     * @param options The options for the generator.
     */
    constructor(options = {}) {
        this.options = options;
    }
    /**
     * Generates the schema in JSON format for validating a content against a given definition.
     *
     * @param bundle The bundle to generate the schema based on.
     *
     * @returns The JSON schema in JSON format.
     */
    generate(bundle) {
        return JSON.stringify(this.visitBundle(bundle), null, 2);
    }
    /**
     * Generates the schema in object form for validating a content against a given definition.
     *
     * @param bundle The bundle to generate the schema based on.
     *
     * @returns The JSON schema in object form.
     */
    visitBundle(bundle) {
        const visitor = this.getVisitor();
        return {
            ...visitor.visit(bundle.root),
            $defs: {
                external: Object.fromEntries(Object.entries(bundle.definitions).map(([name, definition]) => {
                    const referencedSchema = visitor.visit(definition);
                    if (definition.type === 'structure') {
                        delete referencedSchema.additionalProperties;
                    }
                    return [ContentJsonSchemaVisitor.getReferenceRefId(name), referencedSchema];
                })),
                internal: visitor.getReferencedDefinitions(),
            },
        };
    }
    /**
     * Generates the schema in object form for validating a content against the given definition.
     *
     * @param definition The definition to generate the schema based on.
     *
     * @returns The JSON schema in object form.
     */
    visit(definition) {
        return this.getVisitor().visit(definition);
    }
    /**
     * Creates a visitor for generating JSON schemas.
     *
     * @returns A visitor for generating JSON schemas.
     */
    getVisitor() {
        return new ContentJsonSchemaVisitor(this.options);
    }
}
exports.ContentJsonSchemaGenerator = ContentJsonSchemaGenerator;
