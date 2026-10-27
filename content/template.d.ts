import type { JsonObject, JsonPrimitive, JsonValue } from '@croct/json';
import type { Log, Logger } from '@croct/logging';
import type { Content, PrimitiveType } from './content';
/**
 * The map of codes to details.
 */
type LogDetailsMap = {
    'type-mismatch': {
        pointer: string;
        expected: string;
        actual: string;
    };
    'placeholder-interpolation': {
        pointer: string;
        cause: string;
    };
    'evaluation-failed': {
        expression: string;
        cause: string;
    };
    'batch-evaluation-failed': {
        expressions: string[];
        cause: string;
    };
};
/**
 * The template log details.
 */
type TemplateLogDetails = {
    [key in keyof LogDetailsMap]: LogDetailsMap[key] & {
        code: key;
    };
}[keyof LogDetailsMap];
/**
 * The template log.
 */
export type TemplateLog = Log<TemplateLogDetails>;
/**
 * The definition of a dynamic value
 */
type DynamicValueDefinition = {
    /**
     * The CQL expression that evaluates to the value.
     */
    expression: string;
    /**
     * The type of the value.
     */
    type: PrimitiveType;
    /**
     * The default value in case the evaluation fails, results in null,
     * or yields a value of unexpected type.
     */
    default: JsonPrimitive;
    /**
     * Whether the expression can result in a null value.
     */
    nullable?: boolean;
};
/**
 * The map of dynamic values.
 */
type VariableMapping = {
    /**
     * The CQL expression that evaluates to the value.
     */
    expression: string;
    /**
     * A map of pointers to the dynamic values.
     */
    pointers: Record<string, Omit<DynamicValueDefinition, 'expression'>>;
};
/**
 * The template options.
 */
export type TemplateOptions = {
    /**
     * The name of the property that discriminates types in unions.
     *
     * Defaults to `$type`.
     */
    discriminatorProperty: string;
};
/**
 * The definition of a template.
 */
export type TemplateDefinition = {
    /**
     * The list of variables.
     */
    variables: VariableMapping[];
    /**
     * The list of template attributes in the order they should be resolved.
     */
    placeholderAttributes: string[];
    /**
     * The partial static content.
     */
    partialContent: JsonObject;
};
/**
 * A function that evaluates a batch of expressions and returns their results.
 *
 * If the result for an expression is undefined, the result is set to the default value and no error
 * is logged. This is useful for generating static default content.
 *
 * Expressions may fail individually by returning an `Error` object as the result.
 *
 * @param expression The CQL expression to evaluate.
 *
 * @returns The result of the evaluation.
 */
export type EvaluationFunction = (expressions: string[]) => Promise<Array<JsonValue | Error | undefined>>;
/**
 * The interpolation options.
 */
export type InterpolationOptions = {
    /**
     * A logger to use for logging errors during the interpolation.
     */
    logger?: Logger<TemplateLog>;
};
/**
 * A content template.
 */
export declare class ContentTemplate {
    /**
     * The variable mappings.
     */
    private readonly variables;
    /**
     * The placeholder pointers.
     */
    private readonly placeholderAttributes;
    /**
     * The partial static content.
     */
    private readonly partialContent;
    /**
     * Constructs a new instance.
     *
     * @param definition The content template definition.
     */
    constructor(definition: TemplateDefinition);
    /**
     * Creates a template for the given content.
     *
     * @param content The content to templatize.
     * @param options The template options.
     *
     * @returns The template.
     */
    static templatize(content: Content<'structure'>, options?: Partial<TemplateOptions>): ContentTemplate;
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
    private static isCompatible;
    /**
     * Returns the JSON representation of the template.
     *
     * @returns The JSON representation of the template.
     */
    toJSON(): TemplateDefinition;
    /**
     * Interpolates the template using the given evaluation function.
     *
     * @param evaluator The evaluation function.
     * @param options  The interpolation options.
     *
     * @returns The interpolated content.
     */
    interpolate(evaluator: EvaluationFunction, options?: InterpolationOptions): Promise<JsonObject>;
}
export {};
