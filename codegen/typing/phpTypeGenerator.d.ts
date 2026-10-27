import type { JsonPointer } from '@croct/json-pointer';
import { ContentDefinition } from '../../definition';
import type { CodeGenerator, ContentDefinitionCollection } from '../codeGenerator';
import Dispatcher = ContentDefinition.Dispatcher;
/**
 * The options for the PHP type generator.
 */
export type PhpTypeOptions = {
    /**
     * The name of the property that discriminates between the members of a union.
     */
    discriminatorProperty?: string;
    /**
     * The name of the collection holding the reusable component definitions.
     */
    componentCollection?: string;
    /**
     * The name of the collection holding the fetchable slot definitions.
     */
    slotCollection?: string;
    /**
     * The namespace of the content type holders.
     */
    contentNamespace?: string;
    /**
     * The namespace of the `Plug` fetcher.
     */
    plugNamespace?: string;
    /**
     * The short name of the interface holding the named component types.
     */
    componentsInterface?: string;
    /**
     * The short name of the interface holding the named slot types.
     */
    slotsInterface?: string;
    /**
     * The short name of the interface holding the component id union and the indexed component map.
     */
    componentMapInterface?: string;
    /**
     * The short name of the interface holding the slot id union and the indexed slot map.
     */
    slotMapInterface?: string;
    /**
     * The short name of the fetcher interface.
     */
    plugInterface?: string;
    /**
     * The name of the type alias for the union of all component keys.
     */
    componentIdType?: string;
    /**
     * The name of the type alias for the union of all slot keys.
     */
    slotIdType?: string;
    /**
     * The name of the type alias for the indexed component map.
     */
    componentMapType?: string;
    /**
     * The name of the type alias for the indexed slot map.
     */
    slotMapType?: string;
    /**
     * The name of the content-fetching method.
     */
    method?: string;
    /**
     * The name of the fetch method's key parameter.
     */
    keyParameter?: string;
    /**
     * The name of the fetch method's options parameter.
     */
    optionsParameter?: string;
    /**
     * The name (or fully-qualified name) of the result wrapper class, generic over the content,
     * fallback and schema-flag types, e.g. `FetchResult<TContent, TFallback, TSchema>`.
     */
    resultClass?: string;
    /**
     * The name (or fully-qualified name) of the options class, generic over the fallback and
     * schema-flag types, e.g. `FetchOptions<TFallback, TSchema>`.
     */
    optionsClass?: string;
    /**
     * The name of the fallback template parameter used in the generated method.
     */
    fallbackParameter?: string;
    /**
     * The name of the schema-flag template parameter used in the generated method.
     */
    schemaParameter?: string;
};
/**
 * A collection of versioned content definition bundles to generate PHP types for.
 */
export type PhpContentDefinitionCollection = ContentDefinitionCollection;
/**
 * PHP type generator.
 *
 * It produces a single stub file with five interfaces that AUGMENT the empty interfaces shipped by
 * the SDK, so that static analyzers (PHPStan and Psalm) expose reusable, named content types and
 * infer the precise content type from the fetch key:
 *
 * Versions are collapsed to their major (the latest minor of each major is the representative).
 */
export declare class PhpTypeGenerator extends Dispatcher<string> implements CodeGenerator<[PhpContentDefinitionCollection]> {
    /**
     * The canonicalizer options used for the canonical content shapes.
     */
    private static readonly CANONICALIZER_OPTIONS;
    /**
     * The type used as the fallthrough content type for unknown keys.
     */
    private static readonly UNKNOWN_CONTENT;
    /**
     * The generator options.
     */
    private readonly options;
    /**
     * The map of canonical references to definitions, set per generation.
     */
    private references;
    /**
     * Constructs a new instance.
     *
     * @param options The generator options.
     */
    constructor(options?: PhpTypeOptions);
    generate(collection: PhpContentDefinitionCollection): string;
    protected visitBoolean(): string;
    protected visitText(definition: ContentDefinition<'text'>): string;
    protected visitNumber(definition: ContentDefinition<'number'>): string;
    protected visitStructure(definition: ContentDefinition<'structure'>, path: JsonPointer): string;
    protected visitList(definition: ContentDefinition<'list'>, path: JsonPointer): string;
    protected visitUnion(definition: ContentDefinition<'union'>, path: JsonPointer): string;
    protected visitReference(definition: ContentDefinition<'reference'>): string;
    /**
     * Renders the stub file from the component and slot type groups.
     *
     * @param components The component type groups.
     * @param slots     The slot type groups.
     */
    private render;
    /**
     * Renders the dual `@phpstan-type`/`@psalm-type` alias lines for the given type groups.
     *
     * @param groups The type groups to render.
     */
    private renderAliases;
    /**
     * Renders the type expression for a top-level named type.
     *
     * A reference root is inlined to avoid an alias-to-alias, which Psalm does not expand.
     *
     * @param reference The canonical reference of the type's root shape.
     */
    private renderType;
    /**
     * Follows references until a non-reference definition is reached.
     *
     * @param definition The definition to dereference.
     */
    private dereference;
    /**
     * Renders the non-private attributes of a structure as array-shape fields.
     *
     * @param definition The structure to render.
     * @param path       The path to the structure.
     */
    private renderFields;
    /**
     * Collects the versioned, named type groups of a collection's definitions.
     *
     * Versions are collapsed to their major; the latest minor of each major is the representative.
     *
     * @param definitions  The definitions to collect.
     * @param references   The map of canonical references to definitions, populated in place.
     * @param parseVersion The version parser.
     */
    private static collectTypes;
    /**
     * Builds the id-union and indexed-map doc lines for the given type groups.
     *
     * @param groups  The type groups.
     * @param source  The interface the named types are imported from.
     * @param idType  The name of the id-union alias.
     * @param mapType The name of the indexed-map alias.
     */
    private static renderMap;
    /**
     * Builds the key-to-type entries (bare, `@latest` and `@<major>`) for the given type groups.
     *
     * @param groups The type groups.
     */
    private static buildEntries;
    /**
     * Builds the conditional return-type lines mapping each key to its result type.
     *
     * @param entries           The key-to-type entries.
     * @param keyParameter      The name of the key parameter the conditional narrows on.
     * @param resultClass       The result wrapper class.
     * @param fallbackParameter The fallback template parameter name.
     * @param schemaParameter The schema-flag template parameter name.
     */
    private static buildReturn;
    /**
     * Builds the dual `@phpstan-import-type`/`@psalm-import-type` lines for the given names.
     *
     * @param names  The type names to import.
     * @param source The interface to import them from.
     */
    private static renderImports;
    /**
     * Builds an interface declaration preceded by a doc block holding the given lines.
     *
     * @param name     The interface name.
     * @param contents The doc-block content lines.
     */
    private static defineInterface;
    /**
     * Renders a PHPDoc block from the given content lines at the given indentation.
     *
     * @param contents The content lines (without the leading asterisk).
     * @param indent   The indentation to prefix each line with.
     */
    private static renderDocBlock;
    /**
     * Formats an id as a PascalCase PHP identifier.
     *
     * Mirrors the TypeScript generator, except `$` is excluded (it is not valid in PHP identifiers).
     *
     * @param identifier The value to format.
     */
    private static formatIdentifier;
    /**
     * Formats an array-shape key as a quoted string literal.
     *
     * @param key The key to format.
     */
    private static formatKey;
    /**
     * Escapes a value to be used inside a single-quoted PHP string literal.
     *
     * @param value The value to escape.
     */
    private static escape;
}
