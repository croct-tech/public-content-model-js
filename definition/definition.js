"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDefinition = void 0;
const json_pointer_1 = require("@croct/json-pointer");
var ContentDefinition;
(function (ContentDefinition) {
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
         * @returns {T} The visitor's return value
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
                case 'union':
                    return this.visitUnion(definition, path);
                case 'reference':
                    return this.visitReference(definition, path);
            }
        }
    }
    ContentDefinition.Dispatcher = Dispatcher;
    /**
     * A visitor that dispatches the call to the corresponding method with a default return value.
     *
     * @typeParam T The type of the visitor's return value.
     */
    class PartialVisitor extends Dispatcher {
        visitBoolean(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitText(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitNumber(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitStructure(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitList(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitUnion(definition, path) {
            return this.visitDefinition(definition, path);
        }
        visitReference(definition, path) {
            return this.visitDefinition(definition, path);
        }
    }
    ContentDefinition.PartialVisitor = PartialVisitor;
})(ContentDefinition || (exports.ContentDefinition = ContentDefinition = {}));
