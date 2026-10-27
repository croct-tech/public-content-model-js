import type { JsonPrimitive } from '@croct/json';
import { JsonPointer } from '@croct/json-pointer';
/**
 * A map of value types to their content.
 *
 * @typeParam T The value type ('static' or 'dynamic').
 */
type PrimitiveValueMap<T extends JsonPrimitive = JsonPrimitive> = {
    static: null extends T ? never : {
        value: T;
    };
    dynamic: (null extends T ? {
        nullable: true;
        default?: T;
    } : {
        nullable?: boolean;
        default: T;
    }) & {
        expression: string;
    };
};
/**
 * The set of all primitive value types.
 */
export type PrimitiveValueType = keyof PrimitiveValueMap;
/**
 * A single primitive value.
 *
 * @typeParam V The content type.
 * @typeParam T The content value type ('static' or 'dynamic').
 */
export type PrimitiveValue<V extends NonNullable<JsonPrimitive> = NonNullable<JsonPrimitive>, T extends PrimitiveValueType = PrimitiveValueType> = {
    [K in keyof PrimitiveValueMap<V>]: (PrimitiveValueMap<V> | PrimitiveValueMap<null>)[K] & {
        type: K;
    };
}[T];
/**
 * A list item
 */
export type ListItem<T extends Content> = T & {
    label?: string;
};
/**
 * A map of content types to their content.
 *
 * @typeParam P The primitive value type ('static' or 'dynamic').
 */
type ContentMap<P extends PrimitiveValueType = PrimitiveValueType> = {
    text: {
        /**
         * The text content.
         */
        value: PrimitiveValue<string, P>;
    };
    boolean: {
        /**
         * The boolean content.
         */
        value: PrimitiveValue<boolean, P>;
    };
    number: {
        /**
         * The number content.
         */
        value: PrimitiveValue<number, P>;
    };
    structure: {
        /**
         * The name of the structure.
         *
         * This is typically used as discriminator for distinguishing between subtypes
         * of the same structure.
         */
        name?: string;
        /**
         * The structure's attributes.
         */
        attributes: Record<string, Content>;
    };
    list: {
        /**
         * The list's items.
         */
        items: Array<ListItem<Content>>;
    };
};
/**
 * The set of all content types.
 */
export type ContentType = keyof ContentMap;
/**
 * The set of all primitive types.
 */
export type PrimitiveType = keyof {
    [K in keyof ContentMap as ContentMap[K] extends {
        value: PrimitiveValue;
    } ? K : never]: never;
};
/**
 * A single content.
 *
 * @typeParam T The content type.
 * @typeParam P The primitive value type ('static' or 'dynamic').
 */
export type Content<T extends ContentType = ContentType, V extends PrimitiveValueType = PrimitiveValueType> = {
    [K in keyof ContentMap]: ContentMap<V>[K] & {
        type: K;
    };
}[T];
export declare namespace Content {
    /**
     * Checks whether the given content is a primitive value.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is a primitive value, `false` otherwise.
     */
    function isPrimitive(content: Content): content is Content<PrimitiveType>;
    /**
     * Checks whether the value of the given content is static.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is static, `false` otherwise.
     */
    function isStatic(content: Content): content is Content<PrimitiveType, 'static'>;
    /**
     * Checks whether the value of the given content is dynamic.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is dynamic, `false` otherwise.
     */
    function isDynamic(content: Content): content is Content<PrimitiveType, 'dynamic'>;
    /**
     * Checks whether the value of the given content is nullable.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is nullable, `false` otherwise.
     */
    function isNullable(content: Content): content is Content<PrimitiveType, 'static'>;
    /**
     * A content visitor.
     *
     * Visitor is a generic interface for classes that perform an operation on a
     * content, usually by traversing it.
     *
     * @typeParam T The type of the visitor's return value
     */
    interface Visitor<T> {
        /**
         * Visit a content definition.
         *
         * @param definition The definition to visit
         *
         * @returns {T} The visitor's return value
         */
        visit(definition: Content): T;
    }
    /**
     * A visitor that dispatches the call to specific visit methods.
     *
     * @typeParam T The type of the visitor's return value.
     */
    abstract class Dispatcher<T> implements Visitor<T> {
        /**
         * Visit a content definition.
         *
         * @param definition The definition to visit
         * @param path The path to the definition.
         *
         * @returns {T} The visitor's return value.
         */
        visit(definition: Content, path?: JsonPointer): T;
        /**
         * Visit a boolean content.
         *
         * @param definition The content to visit.
         * @param path The path to the content.
         *
         * @returns {T} The result.
         */
        protected abstract visitBoolean(definition: Content<'boolean'>, path: JsonPointer): T;
        /**
         * Visit a text content.
         *
         * @param definition The content to visit.
         * @param path The path to the definition.
         *
         * @returns {T} The result.
         */
        protected abstract visitText(definition: Content<'text'>, path: JsonPointer): T;
        /**
         * Visit a number content.
         *
         * @param definition The content to visit.
         * @param path The path to the content.
         *
         * @returns {T} The result.
         */
        protected abstract visitNumber(definition: Content<'number'>, path: JsonPointer): T;
        /**
         * Visit a structure content.
         *
         * @param definition The content to visit.
         * @param path The path to the content.
         *
         * @returns {T} The result.
         */
        protected abstract visitStructure(definition: Content<'structure'>, path: JsonPointer): T;
        /**
         * Visit a list content.
         *
         * @param definition The content to visit.
         * @param path The path to the content.
         *
         * @returns {T} The result.
         */
        protected abstract visitList(definition: Content<'list'>, path: JsonPointer): T;
    }
    /**
     * A visitor that dispatches the call to the corresponding method with a default return value.
     *
     * @typeParam T The type of the visitor's return value.
     */
    abstract class PartialVisitor<T> extends Dispatcher<T> {
        protected visitBoolean(definition: Content<'boolean'>, path: JsonPointer): T;
        protected visitText(definition: Content<'text'>, path: JsonPointer): T;
        protected visitNumber(definition: Content<'number'>, path: JsonPointer): T;
        protected visitStructure(definition: Content<'structure'>, path: JsonPointer): T;
        protected visitList(definition: Content<'list'>, path: JsonPointer): T;
        /**
         * The default return value for non-overridden methods.
         *
         * @param definition The content to visit.
         * @param path The path to the content.
         *
         * @returns {T} The default result.
         */
        protected abstract visitContent(definition: Content, path: JsonPointer): T;
    }
}
export {};
