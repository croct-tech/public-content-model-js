"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceCanonicalizer = void 0;
const object_hash_1 = __importDefault(require("object-hash"));
const definition_1 = require("../../definition");
var PartialVisitor = definition_1.ContentDefinition.PartialVisitor;
/**
 * A visitor that canonicalizes the references of a content definition.
 *
 * This visitor finds shared definitions and replaces them with a reference
 * to a single definition to reduce the size of the generated code.
 */
class ReferenceCanonicalizer extends PartialVisitor {
    constructor(referenceMap, options) {
        super();
        this.referenceMap = referenceMap;
        this.options = options;
    }
    static canonicalize(bundle, options) {
        const referenceMap = {};
        for (const [id, definition] of Object.entries(bundle.definitions)) {
            referenceMap[id] = definition;
        }
        const visitor = new ReferenceCanonicalizer(referenceMap, options);
        const canonicalDefinitions = {};
        for (const definition of Object.values(bundle.definitions)) {
            const key = ReferenceCanonicalizer.getReferenceId(definition, options);
            if (canonicalDefinitions[key] === undefined) {
                canonicalDefinitions[key] = visitor.visit(definition);
            }
        }
        return {
            root: visitor.visit(bundle.root),
            definitions: canonicalDefinitions,
        };
    }
    visitStructure(definition, path) {
        return {
            ...definition,
            attributes: Object.fromEntries(Object.entries(definition.attributes).map(([name, attribute]) => [
                name,
                {
                    ...attribute,
                    type: this.visit(attribute.type, path.joinedWith([name])),
                },
            ])),
        };
    }
    visitList(definition, path) {
        return {
            ...definition,
            items: this.visit(definition.items, path.joinedWith(['-'])),
        };
    }
    visitUnion(definition, path) {
        return {
            ...definition,
            types: Object.fromEntries(Object.entries(definition.types).map(([discriminator, type]) => [
                discriminator,
                this.visit(type, path),
            ])),
        };
    }
    visitReference(definition) {
        return {
            ...definition,
            id: ReferenceCanonicalizer.getReferenceId(this.referenceMap[definition.id], this.options),
        };
    }
    visitDefinition(definition) {
        return definition;
    }
    static getReferenceId(definition, options) {
        return options.prefix + (options.hash ?? ReferenceCanonicalizer.DEFAULT_HASH)(definition);
    }
}
exports.ReferenceCanonicalizer = ReferenceCanonicalizer;
/**
 * The default hash function: the first 8 hexadecimal characters of the MD5 of the definition.
 */
ReferenceCanonicalizer.DEFAULT_HASH = definition => (0, object_hash_1.default)(definition, { algorithm: 'md5' })
    .substring(0, 8);
