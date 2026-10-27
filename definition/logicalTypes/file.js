"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileTemplate = void 0;
exports.createFileSchema = createFileSchema;
/**
 * A file definition template.
 */
exports.fileTemplate = {
    type: 'text',
    logicalType: 'file',
    format: 'url',
    template: true,
};
/**
 * Creates a schema for validating the properties of a file definition template.
 *
 * @param options The options for the schema.
 */
function createFileSchema(options = {}) {
    return {
        type: 'object',
        properties: {
            allowedTypes: {
                type: 'array',
                title: 'Allowed types',
                description: 'The list of allowed types.',
                examples: [['image/png', 'image/jpeg'], ['audio/mpeg']],
                items: {
                    type: 'string',
                    title: 'Allowed type',
                    ...(options.allowedTypes !== undefined
                        ? { enum: [...new Set(options.allowedTypes)] }
                        : {}),
                    description: 'The allowed type.',
                    examples: ['image/png', 'audio/mpeg'],
                    minLength: 1,
                },
                minItems: 1,
            },
            minimumSize: {
                type: 'integer',
                title: 'Minimum size',
                description: 'The minimum allowed file size in bytes, inclusive.',
                examples: [1024, 1024 * 1024],
                ...(options.minimumSize !== undefined ? { minimum: options.minimumSize } : {}),
                ...(options.maximumSize !== undefined ? { maximum: options.maximumSize } : {}),
                ...(options.validateSizeRange === true
                    ? { allOf: [{ maximum: { $data: '1/maximumSize' } }] }
                    : {}),
            },
            maximumSize: {
                type: 'integer',
                title: 'Maximum size',
                description: 'The maximum allowed file size in bytes, inclusive.',
                examples: [1024, 1024 * 1024],
                ...(options.minimumSize !== undefined ? { minimum: options.minimumSize } : {}),
                ...(options.maximumSize !== undefined
                    ? { maximum: options.maximumSize }
                    : {}),
            },
        },
        additionalProperties: false,
    };
}
