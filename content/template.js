"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentTemplate = void 0;
const json_pointer_1 = require("@croct/json-pointer");
const logging_1 = require("@croct/logging");
const utils_1 = require("../utils");
const placeholder_1 = require("./placeholder");
/**
 * A content rendering planner.
 *
 * This class is stateful and should not be reused across multiple executions.
 */
class ContentRenderingPlanner {
    /**
     * Constructs a new instance.
     *
     * @param options The template options.
     */
    constructor(options) {
        /**
         * The current path.
         */
        this.pointer = json_pointer_1.JsonPointer.root();
        /**
         * The map of query IDs to the list of dynamic values.
         */
        this.variables = {};
        /**
         * The map of template attributes indexed by their pointer.
         */
        this.placeholderAttributes = new Map();
        /**
         * The partial static content.
         */
        this.partialContent = {};
        this.options = options;
    }
    /**
     * Visits the given value.
     *
     * @param content The content to visit.
     */
    visit(content) {
        this.visitRecursively(content);
        this.resolvePlaceholderAttributes();
    }
    /**
     * Resolves the placeholders in the template attributes.
     *
     * This method should be called after all attributes have been visited.
     * It resolves the order in which the attributes should be resolved,
     * interpolating invalid placeholders and placeholders that depend
     * on static-only attributes.
     *
     * After this method is called, the list of template attributes is
     * guaranteed to contain only valid placeholders ordered by resolution
     * order.
     */
    resolvePlaceholderAttributes() {
        const graph = new Map();
        for (const [path, attribute] of this.placeholderAttributes.entries()) {
            const dependencies = new Set();
            for (const dependency of attribute.dependencies) {
                const dependencyPath = dependency.toString();
                if (this.placeholderAttributes.has(dependencyPath)) {
                    dependencies.add(dependencyPath);
                }
            }
            graph.set(path, dependencies);
        }
        const resolution = (0, utils_1.toposort)(graph);
        const invalidPointers = new Set();
        for (const path of this.placeholderAttributes.keys()) {
            if (!resolution.order.includes(path)) {
                invalidPointers.add(path);
            }
        }
        const preservedPointers = new Set();
        for (const mapping of Object.values(this.variables)) {
            for (const path of Object.keys(mapping.pointers)) {
                preservedPointers.add(path);
            }
        }
        const resolvedPointers = new Set(resolution.order);
        for (const path of resolution.order.concat(Array.from(invalidPointers))) {
            try {
                const pointer = this.placeholderAttributes.get(path).location;
                const value = pointer.get(this.partialContent);
                if (typeof value === 'string') {
                    const resolvedValue = placeholder_1.Placeholder.interpolate(value, this.partialContent, {
                        basePointer: pointer,
                        invalidPointers: invalidPointers,
                        ignoredPointers: preservedPointers,
                    });
                    pointer.set(this.partialContent, resolvedValue);
                    if (resolvedValue.match(placeholder_1.Placeholder.PATTERN) === null) {
                        resolvedPointers.delete(path);
                    }
                }
            }
            catch {
                // Placeholder cannot be resolved, ignore
            }
        }
        const placeholderAttributes = new Map(this.placeholderAttributes);
        this.placeholderAttributes.clear();
        for (const pointer of resolvedPointers) {
            this.placeholderAttributes.set(pointer.toString(), placeholderAttributes.get(pointer.toString()));
        }
    }
    /**
     * Sets the value for the attribute at the current pointer.
     *
     * @param attribute The attribute value.
     * @param type The attribute type.
     */
    setAttributeValue(attribute, type) {
        switch (attribute.type) {
            case 'static':
                this.setStaticValue(attribute.value);
                break;
            case 'dynamic':
                this.setDynamicValue({
                    type: type,
                    nullable: attribute.nullable,
                    expression: attribute.expression,
                    default: attribute.default ?? null,
                });
                break;
        }
    }
    /**
     * Returns the variable mappings.
     *
     * @returns The list of variable mappings.
     */
    getVariables() {
        return Object.values(this.variables);
    }
    /**
     * Returns the list of placeholders.
     *
     * The list is ordered by resolution order, where attributes that depend on
     * other attributes are placed after the attributes they depend on.
     *
     * @returns The list of placeholders.
     */
    getPlaceholderAttributes() {
        return Array.from(this.placeholderAttributes.keys());
    }
    /**
     * Returns the partial static content.
     *
     * @returns The partial static content.
     */
    getPartialContent() {
        return this.partialContent;
    }
    /**
     * Visits the given content recursively.
     *
     * @param content The content to visit.
     */
    visitRecursively(content) {
        switch (content.type) {
            case 'number':
            case 'boolean':
                this.setAttributeValue(content.value, content.type);
                break;
            case 'text': {
                const { value } = content;
                this.setAttributeValue(value, content.type);
                const text = value.type === 'static' ? value.value : value.default;
                if (typeof text === 'string') {
                    const placeholders = placeholder_1.Placeholder.extract(text, this.pointer);
                    if (placeholders.length > 0) {
                        this.addPlaceholderAttribute({
                            location: this.pointer,
                            dependencies: placeholders.map(placeholder => placeholder.pointer),
                        });
                    }
                }
                break;
            }
            case 'list':
                this.setStaticValue([]);
                content.items.forEach((value, index) => {
                    this.push(index);
                    this.visitRecursively(value);
                    this.pop();
                });
                break;
            case 'structure': {
                const structure = content.name !== undefined
                    ? { [this.options.discriminatorProperty]: content.name }
                    : {};
                if (this.pointer.isRoot()) {
                    this.partialContent = structure;
                }
                else {
                    this.setStaticValue(structure);
                }
                Object.entries(content.attributes).forEach(([name, value]) => {
                    this.push(name);
                    this.visitRecursively(value);
                    this.pop();
                });
                break;
            }
        }
    }
    /**
     * Appends the given segment to the current pointer.
     *
     * @param segment The segment to push.
     */
    push(segment) {
        this.pointer = this.pointer.joinedWith([segment]);
    }
    /**
     * Pops the last segment from the current pointer.
     */
    pop() {
        this.pointer = this.pointer.getParent();
    }
    /**
     * Add the given template attribute.
     *
     * @param attribute The template attribute.
     * @param dependencies The list of dependencies.
     */
    addPlaceholderAttribute(attribute) {
        this.placeholderAttributes.set(attribute.location.toString(), attribute);
    }
    /**
     * Sets a static value at the current pointer.
     *
     * @param value The static value.
     */
    setStaticValue(value) {
        this.pointer.set(this.partialContent, value);
    }
    /**
     * Sets a dynamic value at the current pointer.
     *
     * @param value The dynamic value.
     */
    setDynamicValue(value) {
        const queryId = value.expression;
        if (this.variables[queryId] === undefined) {
            this.variables[queryId] = {
                expression: value.expression,
                pointers: {},
            };
        }
        this.variables[queryId].pointers[this.pointer.toString()] = {
            type: value.type,
            default: value.default,
            ...(value.nullable !== undefined ? { nullable: value.nullable } : null),
        };
    }
}
/**
 * A content template.
 */
class ContentTemplate {
    /**
     * Constructs a new instance.
     *
     * @param definition The content template definition.
     */
    constructor(definition) {
        this.variables = definition.variables;
        this.placeholderAttributes = new Map(definition.placeholderAttributes.map(placeholder => [placeholder, json_pointer_1.JsonPointer.parse(placeholder)]));
        this.partialContent = definition.partialContent;
    }
    /**
     * Creates a template for the given content.
     *
     * @param content The content to templatize.
     * @param options The template options.
     *
     * @returns The template.
     */
    static templatize(content, options = {}) {
        const visitor = new ContentRenderingPlanner({
            discriminatorProperty: options.discriminatorProperty ?? '$type',
        });
        visitor.visit(content);
        return new ContentTemplate({
            variables: visitor.getVariables(),
            placeholderAttributes: visitor.getPlaceholderAttributes(),
            partialContent: visitor.getPartialContent(),
        });
    }
    /**
     * Checks whether a value is compatible with a dynamic value definition.
     *
     * Notice that this check can't reliably check if compound values
     * (like objects and arrays) are compatible – they are for completeness only.
     *
     * Checking compound values would require knowing the full schema and
     * deeply traversal. Because it's costly to perform in runtime, lists
     * and structures don't support dynamic values. It's the application's
     * responsibility to take the necessary precautions.
     */
    static isCompatible(value, definition) {
        if (value === null) {
            return definition.nullable === true;
        }
        switch (definition.type) {
            case 'text':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
        }
    }
    /**
     * Returns the JSON representation of the template.
     *
     * @returns The JSON representation of the template.
     */
    toJSON() {
        return {
            variables: this.variables,
            placeholderAttributes: Array.from(this.placeholderAttributes.keys()),
            partialContent: this.partialContent,
        };
    }
    /**
     * Interpolates the template using the given evaluation function.
     *
     * @param evaluator The evaluation function.
     * @param options  The interpolation options.
     *
     * @returns The interpolated content.
     */
    async interpolate(evaluator, options = {}) {
        if (this.variables.length === 0) {
            return this.partialContent;
        }
        const { logger = new logging_1.SuppressedLogger() } = options;
        const content = structuredClone(this.partialContent);
        const dynamicValuePaths = new Set(this.variables
            .map(({ pointers }) => Object.keys(pointers))
            .flat());
        const results = await evaluator(this.variables.map(variable => variable.expression))
            .catch(error => {
            logger.log({
                level: logging_1.LogLevel.ERROR,
                message: 'Failed to process evaluation batch.',
                details: {
                    code: 'batch-evaluation-failed',
                    expressions: this.variables.map(variable => variable.expression),
                    cause: (0, logging_1.extractErrorMessage)(error),
                },
            });
            // Every variable will be associated with `undefined`, which ultimately
            // results in the default value being used.
            return [];
        });
        for (const [variableIndex, variable] of this.variables.entries()) {
            const result = results[variableIndex];
            if (result instanceof Error) {
                logger.log({
                    level: logging_1.LogLevel.ERROR,
                    message: 'Failed to evaluate dynamic value.',
                    details: {
                        code: 'evaluation-failed',
                        expression: variable.expression,
                        cause: (0, logging_1.extractErrorMessage)(result),
                    },
                });
                for (const [path, { default: defaultValue }] of Object.entries(variable.pointers)) {
                    dynamicValuePaths.delete(path);
                    json_pointer_1.JsonPointer.parse(path).set(content, defaultValue);
                }
                continue;
            }
            for (const [path, definition] of Object.entries(variable.pointers)) {
                let value = result;
                if (value === undefined || (value === null && definition.nullable === true)) {
                    dynamicValuePaths.delete(path);
                    value = definition.default;
                }
                else if (!ContentTemplate.isCompatible(value, definition)) {
                    dynamicValuePaths.delete(path);
                    value = definition.default;
                    const expected = definition.type;
                    const actual = result === null ? 'null' : typeof result;
                    logger.log({
                        level: logging_1.LogLevel.WARNING,
                        message: `Expected ${expected} value for '${path}' but got ${actual} instead.`,
                        details: {
                            code: 'type-mismatch',
                            pointer: path,
                            expected: expected,
                            actual: actual,
                        },
                    });
                }
                if (value !== null) {
                    // Treat null values as omitted attributes.
                    // Since null are formatted as empty strings,
                    // it has no effect on the placeholder interpolation.
                    json_pointer_1.JsonPointer.parse(path).set(content, value);
                }
            }
        }
        for (const pointer of this.placeholderAttributes.values()) {
            const path = pointer.toString();
            if (dynamicValuePaths.has(path)) {
                // Prevent interpolation of dynamic values
                continue;
            }
            try {
                const value = pointer.get(content);
                if (typeof value === 'string') {
                    pointer.set(content, placeholder_1.Placeholder.interpolate(value, content, {
                        basePointer: pointer,
                    }));
                }
            }
            catch (error) {
                logger.log({
                    level: logging_1.LogLevel.ERROR,
                    message: 'Failed to interpolate placeholder.',
                    details: {
                        code: 'placeholder-interpolation',
                        pointer: pointer.toString(),
                        cause: (0, logging_1.extractErrorMessage)(error),
                    },
                });
            }
        }
        return content;
    }
}
exports.ContentTemplate = ContentTemplate;
