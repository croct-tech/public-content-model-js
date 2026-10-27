"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const json_pointer_1 = require("@croct/json-pointer");
var Content;
(function (Content) {
    /**
     * Checks whether the given content is a primitive value.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is a primitive value, `false` otherwise.
     */
    function isPrimitive(content) {
        return content.type === 'text'
            || content.type === 'boolean'
            || content.type === 'number';
    }
    Content.isPrimitive = isPrimitive;
    /**
     * Checks whether the value of the given content is static.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is static, `false` otherwise.
     */
    function isStatic(content) {
        return isPrimitive(content) && content.value.type === 'static';
    }
    Content.isStatic = isStatic;
    /**
     * Checks whether the value of the given content is dynamic.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is dynamic, `false` otherwise.
     */
    function isDynamic(content) {
        return isPrimitive(content) && content.value.type === 'dynamic';
    }
    Content.isDynamic = isDynamic;
    /**
     * Checks whether the value of the given content is nullable.
     *
     * @param content The content to inspect.
     *
     * @returns `true` if the content is nullable, `false` otherwise.
     */
    function isNullable(content) {
        return isDynamic(content) && content.value.nullable === true;
    }
    Content.isNullable = isNullable;
    /**
     * A visitor that dispatches the call to specific visit methods.
     *
     * @typeParam T The type of the visitor's return value.
     */
    class Dispatcher {
        /**
         * Visit a content definition.
         *
         * @param definition The definition to visit
         * @param path The path to the definition.
         *
         * @returns {T} The visitor's return value.
         */
        visit(definition, path = json_pointer_1.JsonPointer.root()) {
            switch (definition.type) {
                case 'boolean':
                    return this.visitBoolean(definition, path);
                case 'text':
                    return this.visitText(definition, path);
                case 'number':
                    return this.visitNumber(definition, path);
                case 'structure':
                    return this.visitStructure(definition, path);
                case 'list':
                    return this.visitList(definition, path);
            }
        }
    }
    Content.Dispatcher = Dispatcher;
    /**
     * A visitor that dispatches the call to the corresponding method with a default return value.
     *
     * @typeParam T The type of the visitor's return value.
     */
    class PartialVisitor extends Dispatcher {
        visitBoolean(definition, path) {
            return this.visitContent(definition, path);
        }
        visitText(definition, path) {
            return this.visitContent(definition, path);
        }
        visitNumber(definition, path) {
            return this.visitContent(definition, path);
        }
        visitStructure(definition, path) {
            return this.visitContent(definition, path);
        }
        visitList(definition, path) {
            return this.visitContent(definition, path);
        }
    }
    Content.PartialVisitor = PartialVisitor;
})(Content || (exports.Content = Content = {}));
