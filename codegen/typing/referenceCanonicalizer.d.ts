import type { JsonPointer } from '@croct/json-pointer';
import type { ContentDefinitionBundle } from '../../definition';
import { ContentDefinition } from '../../definition';
import PartialVisitor = ContentDefinition.PartialVisitor;
/**
 * A function that derives a stable hash from a content definition.
 */
export type DefinitionHash = (definition: ContentDefinition) => string;
/**
 * The canonicalizer options.
 */
export type ReferenceCanonicalizerOptions = {
    /**
     * The prefix to use for the generated references.
     */
    prefix: string;
    /**
     * The function used to derive the hash appended to the prefix.
     *
     * Defaults to {@link ReferenceCanonicalizer.DEFAULT_HASH}.
     */
    hash?: DefinitionHash;
};
/**
 * A visitor that canonicalizes the references of a content definition.
 *
 * This visitor finds shared definitions and replaces them with a reference
 * to a single definition to reduce the size of the generated code.
 */
export declare class ReferenceCanonicalizer extends PartialVisitor<ContentDefinition> {
    /**
     * The default hash function: the first 8 hexadecimal characters of the MD5 of the definition.
     */
    static readonly DEFAULT_HASH: DefinitionHash;
    /**
     * The map of references to definitions.
     */
    private readonly referenceMap;
    /**
     * The canonicalizer options.
     */
    private readonly options;
    private constructor();
    static canonicalize(bundle: ContentDefinitionBundle, options: ReferenceCanonicalizerOptions): ContentDefinitionBundle;
    protected visitStructure(definition: ContentDefinition<'structure'>, path: JsonPointer): ContentDefinition;
    protected visitList(definition: ContentDefinition<'list'>, path: JsonPointer): ContentDefinition;
    protected visitUnion(definition: ContentDefinition<'union'>, path: JsonPointer): ContentDefinition;
    protected visitReference(definition: ContentDefinition<'reference'>): ContentDefinition;
    protected visitDefinition(definition: ContentDefinition): ContentDefinition;
    static getReferenceId(definition: ContentDefinition, options: ReferenceCanonicalizerOptions): string;
}
