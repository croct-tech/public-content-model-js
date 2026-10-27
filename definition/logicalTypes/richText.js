"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.richTextTemplate = void 0;
exports.createRichTextSchema = createRichTextSchema;
/**
 * A rich text definition template.
 */
exports.richTextTemplate = {
    type: 'text',
    logicalType: 'richText',
    template: true,
};
/**
 * Creates a schema for validating the properties of a rich text definition template.
 *
 * @param options The options for the schema.
 */
function createRichTextSchema(options = {}) {
    return {
        type: 'object',
        inheritedProperties: ['minimumLength', 'maximumLength'],
        properties: {
            allowedFormatting: {
                type: 'array',
                title: 'Allowed formatting',
                description: 'The list of allowed formatting.',
                examples: [['bold', 'italic'], ['heading', 'quote']],
                items: {
                    type: 'string',
                    title: 'Formatting',
                    ...(options.allowedFormatting !== undefined
                        ? { enum: [...new Set(options.allowedFormatting)] }
                        : {}),
                    description: 'The allowed formatting.',
                    examples: ['bold', 'heading'],
                    minLength: 1,
                },
                minItems: 1,
            },
            format: {
                type: 'string',
                title: 'Format',
                description: 'The format of the rich text.',
                enum: ['multiline'],
            },
        },
        additionalProperties: false,
    };
}
