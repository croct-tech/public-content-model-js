import type { ContentDefinitionBundle } from '../definition';
/**
 * A code generator.
 *
 * @typeParam T The generator parameters.
 */
export interface CodeGenerator<P extends any[] = []> {
    generate(...args: P): string;
}
/**
 * A collection of versioned content definition bundles.
 */
export type ContentDefinitionCollection<O extends Record<string, any> = Record<string, any>, B extends Record<string, any> = Record<string, any>> = {
    [collection: string]: Omit<O, 'definition'> & {
        definitions: {
            [id: string]: {
                [version: string]: B & ContentDefinitionBundle;
            };
        };
    };
};
/**
 * The input of a definition-based code generator.
 */
type Definition = ContentDefinitionBundle | ContentDefinitionCollection;
/**
 * A definition-based code generator.
 */
export interface DefinitionBasedGenerator<T extends Definition> extends CodeGenerator<[T]> {
    /**
     * Generates code based on the given definition.
     *
     * @param definition The definition for which to generate code.
     *
     * @returns The generated code.
     */
    generate(definition: T): string;
}
export {};
