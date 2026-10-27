import type { JsonPointer } from '@croct/json-pointer';
import { ContentDefinition } from '../../definition';
import type { CodeGenerator, ContentDefinitionCollection } from '../codeGenerator';
import { CodeWriter } from '../codeWriter';
import Dispatcher = ContentDefinition.Dispatcher;
/**
 * The options for the TypeScript type generator.
 */
export type TypescriptTypeOptions = {
    /**
     * The name of the property that discriminates between the different types of a union.
     */
    discriminatorProperty?: string;
};
type GenerationOptions = {
    mapName: string;
};
type BundleMetadata = {
    discriminator?: {
        property: string;
        values: Array<string | null>;
    };
};
export type TypescriptContentDefinitionCollection = ContentDefinitionCollection<GenerationOptions, BundleMetadata>;
/**
 * TypeScript type generator.
 */
export declare class TypescriptTypeGenerator extends Dispatcher<void> implements CodeGenerator<[TypescriptContentDefinitionCollection]> {
    /**
     * The code writer.
     */
    private readonly writer;
    /**
     * The generator options.
     */
    private readonly options;
    /**
     * Constructs a new instance.
     *
     * @param writer The code writer.
     * @param options The generator options.
     */
    constructor(writer?: CodeWriter, options?: TypescriptTypeOptions);
    protected visitBoolean(): void;
    protected visitNumber(): void;
    protected visitText(definition: ContentDefinition<'text'>): void;
    private static formatIdentifier;
    protected visitList(definition: ContentDefinition<'list'>, path: JsonPointer): void;
    private static wrapString;
    protected visitUnion(definition: ContentDefinition<'union'>, path: JsonPointer): void;
    generate(collection: TypescriptContentDefinitionCollection): string;
    protected visitStructure(definition: ContentDefinition<'structure'>, path: JsonPointer): void;
    protected visitReference({ id }: ContentDefinition<'reference'>): void;
    private writeDocBlock;
}
export {};
