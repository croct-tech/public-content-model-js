import type { JSONSchema } from 'json-schema-typed';
import type { ContentDefinitionType } from '../definition';
/**
 * The properties that can be inherited from each content definition type.
 */
export type InheritablePropertyMap = {
    boolean: 'label' | 'default';
    number: 'minimum' | 'maximum' | 'integer';
    text: 'minimumLength' | 'maximumLength' | 'format' | 'pattern' | 'choices';
    list: 'itemLabel' | 'minimumLength' | 'maximumLength';
};
type InheritableType = keyof InheritablePropertyMap;
/**
 * A schema for a logical type and the properties inherited from its parent type.
 *
 * @typeParam T The parent content definition type.
 */
export type LogicalTypeSchema<T extends ContentDefinitionType> = JSONSchema.Object & {
    inheritedProperties?: T extends InheritableType ? ReadonlyArray<InheritablePropertyMap[T]> : never;
};
export {};
