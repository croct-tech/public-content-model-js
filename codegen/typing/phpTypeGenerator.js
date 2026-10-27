"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhpTypeGenerator = void 0;
const definition_1 = require("../../definition");
const version_1 = require("../../version");
const referenceCanonicalizer_1 = require("./referenceCanonicalizer");
var Dispatcher = definition_1.ContentDefinition.Dispatcher;
/**
 * PHP type generator.
 *
 * It produces a single stub file with five interfaces that AUGMENT the empty interfaces shipped by
 * the SDK, so that static analyzers (PHPStan and Psalm) expose reusable, named content types and
 * infer the precise content type from the fetch key:
 *
 * Versions are collapsed to their major (the latest minor of each major is the representative).
 */
class PhpTypeGenerator extends Dispatcher {
    /**
     * Constructs a new instance.
     *
     * @param options The generator options.
     */
    constructor(options = {}) {
        super();
        /**
         * The map of canonical references to definitions, set per generation.
         */
        this.references = new Map();
        this.options = {
            discriminatorProperty: options.discriminatorProperty ?? '_component',
            componentCollection: options.componentCollection ?? '@croct/plug/component',
            slotCollection: options.slotCollection ?? '@croct/plug/slot',
            contentNamespace: options.contentNamespace ?? 'Croct\\Content',
            plugNamespace: options.plugNamespace ?? 'Croct\\Plug',
            componentsInterface: options.componentsInterface ?? 'Components',
            slotsInterface: options.slotsInterface ?? 'Slots',
            componentMapInterface: options.componentMapInterface ?? 'MappedComponents',
            slotMapInterface: options.slotMapInterface ?? 'MappedSlots',
            plugInterface: options.plugInterface ?? 'Plug',
            componentIdType: options.componentIdType ?? 'ComponentId',
            slotIdType: options.slotIdType ?? 'SlotId',
            componentMapType: options.componentMapType ?? 'ComponentMap',
            slotMapType: options.slotMapType ?? 'SlotMap',
            method: options.method ?? 'fetchContent',
            keyParameter: options.keyParameter ?? 'slotId',
            optionsParameter: options.optionsParameter ?? 'options',
            resultClass: options.resultClass ?? 'FetchResponse',
            optionsClass: options.optionsClass ?? 'FetchOptions',
            fallbackParameter: options.fallbackParameter ?? 'F',
            schemaParameter: options.schemaParameter ?? 'S',
        };
    }
    generate(collection) {
        const references = new Map();
        const cache = new Map();
        const parseVersion = version => {
            let parsed = cache.get(version);
            if (parsed === undefined) {
                parsed = version_1.Version.parse(version);
                cache.set(version, parsed);
            }
            return parsed;
        };
        const components = PhpTypeGenerator.collectTypes(collection[this.options.componentCollection]?.definitions ?? {}, references, parseVersion);
        const slots = PhpTypeGenerator.collectTypes(collection[this.options.slotCollection]?.definitions ?? {}, references, parseVersion);
        this.references = references;
        return this.render(components, slots);
    }
    visitBoolean() {
        return 'bool';
    }
    visitText(definition) {
        if (definition.choices !== undefined) {
            return Object.keys(definition.choices)
                .map(choice => `'${PhpTypeGenerator.escape(choice)}'`)
                .join('|');
        }
        return 'string';
    }
    visitNumber(definition) {
        return definition.integer === true ? 'int' : 'int|float';
    }
    visitStructure(definition, path) {
        const fields = this.renderFields(definition, path);
        return fields.length === 0 ? 'array{}' : `array{${fields.join(', ')}}`;
    }
    visitList(definition, path) {
        return `list<${this.visit(definition.items, path)}>`;
    }
    visitUnion(definition, path) {
        const property = PhpTypeGenerator.formatKey(this.options.discriminatorProperty);
        return Object.entries(definition.types)
            .map(([discriminator, type]) => {
            // Inline each member's fields instead of intersecting (`array{...}&Shape`): PHPStan
            // reports an array-shape intersection through an alias as an unresolvable type, so
            // the TypeScript-style `({_component: 'x'} & Subtype)` does not work in PHP. Inlining
            // is sound in both tools (PHPStan narrows the union on the discriminator; Psalm does not).
            const member = this.dereference(type);
            const tag = `${property}: '${PhpTypeGenerator.escape(discriminator)}'`;
            const fields = member?.type === 'structure' ? this.renderFields(member, path) : [];
            return `array{${[tag, ...fields].join(', ')}}`;
        })
            .join('|');
    }
    visitReference(definition) {
        // Inline the referenced shape (the model is acyclic); PHP cannot intersect array-shape aliases.
        const target = this.references.get(definition.id);
        return target === undefined ? PhpTypeGenerator.UNKNOWN_CONTENT : this.visit(target);
    }
    /**
     * Renders the stub file from the component and slot type groups.
     *
     * @param components The component type groups.
     * @param slots     The slot type groups.
     */
    render(components, slots) {
        const { contentNamespace, plugNamespace, componentsInterface, slotsInterface, componentMapInterface, slotMapInterface, plugInterface, componentIdType, slotIdType, componentMapType, slotMapType, method, keyParameter, optionsParameter, optionsClass, resultClass, fallbackParameter, schemaParameter, } = this.options;
        const interfaces = [
            PhpTypeGenerator.defineInterface(componentsInterface, this.renderAliases(components)),
            PhpTypeGenerator.defineInterface(slotsInterface, this.renderAliases(slots)),
            PhpTypeGenerator.defineInterface(componentMapInterface, PhpTypeGenerator.renderMap(components, componentsInterface, componentIdType, componentMapType)),
            PhpTypeGenerator.defineInterface(slotMapInterface, PhpTypeGenerator.renderMap(slots, slotsInterface, slotIdType, slotMapType)),
        ];
        const entries = PhpTypeGenerator.buildEntries(slots);
        const conditional = PhpTypeGenerator.buildReturn(entries, keyParameter, resultClass, fallbackParameter, schemaParameter);
        const usedSlots = [...new Set(entries.map(entry => entry.name))];
        const plugImports = [
            ...PhpTypeGenerator.renderImports([slotIdType], `\\${contentNamespace}\\${slotMapInterface}`),
            ...PhpTypeGenerator.renderImports(usedSlots, `\\${contentNamespace}\\${slotsInterface}`),
        ];
        const methodDoc = [
            `@template ${fallbackParameter} = never`,
            `@template ${schemaParameter} of bool = false`,
            '',
            `@param ${slotIdType} $${keyParameter}`,
            `@param ${optionsClass}<${fallbackParameter}, ${schemaParameter}>|null $${optionsParameter}`,
            '',
            `@phpstan-return ${conditional[0]}`,
            ...conditional.slice(1),
            `@psalm-return ${conditional[0]}`,
            ...conditional.slice(1),
        ];
        return [
            '<?php',
            '',
            `namespace ${contentNamespace} {`,
            ...interfaces.flatMap((block, index) => (index === 0 ? block : ['', ...block])),
            '}',
            '',
            `namespace ${plugNamespace} {`,
            ...PhpTypeGenerator.renderDocBlock(plugImports, '    '),
            `    interface ${plugInterface}`,
            '    {',
            ...PhpTypeGenerator.renderDocBlock(methodDoc, '        '),
            `        public function ${method}(string $${keyParameter}, `
                + `?${optionsClass} $${optionsParameter} = null): ${resultClass};`,
            '    }',
            '}',
            '',
        ].join('\n');
    }
    /**
     * Renders the dual `@phpstan-type`/`@psalm-type` alias lines for the given type groups.
     *
     * @param groups The type groups to render.
     */
    renderAliases(groups) {
        return groups.flatMap(group => {
            const named = [
                ...group.versions,
                {
                    name: group.base,
                    reference: group.latest,
                },
            ];
            return named.flatMap(({ name, reference }) => {
                const type = this.renderType(reference);
                return [
                    `@phpstan-type ${name} = ${type}`,
                    `@psalm-type ${name} = ${type}`,
                ];
            });
        });
    }
    /**
     * Renders the type expression for a top-level named type.
     *
     * A reference root is inlined to avoid an alias-to-alias, which Psalm does not expand.
     *
     * @param reference The canonical reference of the type's root shape.
     */
    renderType(reference) {
        const definition = this.dereference(this.references.get(reference));
        return definition === undefined ? PhpTypeGenerator.UNKNOWN_CONTENT : this.visit(definition);
    }
    /**
     * Follows references until a non-reference definition is reached.
     *
     * @param definition The definition to dereference.
     */
    dereference(definition) {
        let resolved = definition;
        while (resolved?.type === 'reference') {
            resolved = this.references.get(resolved.id);
        }
        return resolved;
    }
    /**
     * Renders the non-private attributes of a structure as array-shape fields.
     *
     * @param definition The structure to render.
     * @param path       The path to the structure.
     */
    renderFields(definition, path) {
        return Object.entries(definition.attributes)
            .filter(([, attribute]) => attribute.private !== true)
            .map(([name, attribute]) => {
            const optional = attribute.optional === true ? '?' : '';
            const type = this.visit(attribute.type, path.joinedWith([name]));
            return `${PhpTypeGenerator.formatKey(name)}${optional}: ${type}`;
        });
    }
    /**
     * Collects the versioned, named type groups of a collection's definitions.
     *
     * Versions are collapsed to their major; the latest minor of each major is the representative.
     *
     * @param definitions  The definitions to collect.
     * @param references   The map of canonical references to definitions, populated in place.
     * @param parseVersion The version parser.
     */
    static collectTypes(definitions, references, parseVersion) {
        const groups = [];
        for (const [id, versions] of Object.entries(definitions)) {
            const majors = new Map();
            for (const [version, bundle] of Object.entries(versions)) {
                const parsed = parseVersion(version);
                const canonical = referenceCanonicalizer_1.ReferenceCanonicalizer.canonicalize(bundle, PhpTypeGenerator.CANONICALIZER_OPTIONS);
                const reference = referenceCanonicalizer_1.ReferenceCanonicalizer.getReferenceId(bundle.root, PhpTypeGenerator.CANONICALIZER_OPTIONS);
                if (!references.has(reference)) {
                    references.set(reference, canonical.root);
                }
                for (const [key, definition] of Object.entries(canonical.definitions)) {
                    if (!references.has(key)) {
                        references.set(key, definition);
                    }
                }
                const current = majors.get(parsed.major);
                if (current === undefined || current.version.compare(parsed) < 0) {
                    majors.set(parsed.major, { version: parsed, reference: reference });
                }
            }
            if (majors.size === 0) {
                continue;
            }
            const ordered = [...majors.entries()].sort(([left], [right]) => left - right);
            const base = PhpTypeGenerator.formatIdentifier(id);
            groups.push({
                id: id,
                base: base,
                latest: ordered[ordered.length - 1][1].reference,
                versions: ordered.map(([major, entry]) => ({
                    major: major,
                    name: `${base}V${major}`,
                    reference: entry.reference,
                })),
            });
        }
        return groups;
    }
    /**
     * Builds the id-union and indexed-map doc lines for the given type groups.
     *
     * @param groups  The type groups.
     * @param source  The interface the named types are imported from.
     * @param idType  The name of the id-union alias.
     * @param mapType The name of the indexed-map alias.
     */
    static renderMap(groups, source, idType, mapType) {
        const entries = PhpTypeGenerator.buildEntries(groups);
        const names = [...new Set(entries.map(entry => entry.name))];
        const ids = entries.length === 0
            ? 'never'
            : entries.map(entry => `'${PhpTypeGenerator.escape(entry.key)}'`).join('|');
        const map = entries.length === 0
            ? 'array{}'
            : `array{${entries.map(entry => `${PhpTypeGenerator.formatKey(entry.key)}: ${entry.name}`).join(', ')}}`;
        return [
            ...PhpTypeGenerator.renderImports(names, source),
            `@phpstan-type ${idType} = ${ids}`,
            `@psalm-type ${idType} = ${ids}`,
            `@phpstan-type ${mapType} = ${map}`,
            `@psalm-type ${mapType} = ${map}`,
        ];
    }
    /**
     * Builds the key-to-type entries (bare, `@latest` and `@<major>`) for the given type groups.
     *
     * @param groups The type groups.
     */
    static buildEntries(groups) {
        return groups.flatMap(group => [
            { key: group.id, name: group.base },
            { key: `${group.id}@latest`, name: group.base },
            ...group.versions.map(version => ({ key: `${group.id}@${version.major}`, name: version.name })),
        ]);
    }
    /**
     * Builds the conditional return-type lines mapping each key to its result type.
     *
     * @param entries           The key-to-type entries.
     * @param keyParameter      The name of the key parameter the conditional narrows on.
     * @param resultClass       The result wrapper class.
     * @param fallbackParameter The fallback template parameter name.
     * @param schemaParameter The schema-flag template parameter name.
     */
    static buildReturn(entries, keyParameter, resultClass, fallbackParameter, schemaParameter) {
        const wrap = (content) => `${resultClass}<${content}, `
            + `${fallbackParameter}, ${schemaParameter}>`;
        const fallthrough = wrap(PhpTypeGenerator.UNKNOWN_CONTENT);
        if (entries.length === 0) {
            return [fallthrough];
        }
        const lines = entries.map((entry, index) => {
            const prefix = index === 0 ? '' : '    : ';
            return `${prefix}($${keyParameter} is '${PhpTypeGenerator.escape(entry.key)}' ? ${wrap(entry.name)}`;
        });
        lines.push(`    : ${fallthrough}${')'.repeat(entries.length)}`);
        return lines;
    }
    /**
     * Builds the dual `@phpstan-import-type`/`@psalm-import-type` lines for the given names.
     *
     * @param names  The type names to import.
     * @param source The interface to import them from.
     */
    static renderImports(names, source) {
        return names.flatMap(name => [
            `@phpstan-import-type ${name} from ${source}`,
            `@psalm-import-type ${name} from ${source}`,
        ]);
    }
    /**
     * Builds an interface declaration preceded by a doc block holding the given lines.
     *
     * @param name     The interface name.
     * @param contents The doc-block content lines.
     */
    static defineInterface(name, contents) {
        return [
            ...PhpTypeGenerator.renderDocBlock(contents, '    '),
            `    interface ${name}`,
            '    {',
            '    }',
        ];
    }
    /**
     * Renders a PHPDoc block from the given content lines at the given indentation.
     *
     * @param contents The content lines (without the leading asterisk).
     * @param indent   The indentation to prefix each line with.
     */
    static renderDocBlock(contents, indent) {
        return [
            `${indent}/**`,
            ...contents.map(line => (line === '' ? `${indent} *` : `${indent} * ${line}`)),
            `${indent} */`,
        ];
    }
    /**
     * Formats an id as a PascalCase PHP identifier.
     *
     * Mirrors the TypeScript generator, except `$` is excluded (it is not valid in PHP identifiers).
     *
     * @param identifier The value to format.
     */
    static formatIdentifier(identifier) {
        return identifier.replace(/[^a-z0-9_]+/gi, '_')
            .replace(/(^[a-z])|_([a-z])/gi, (_, first, second) => (first ?? second).toUpperCase());
    }
    /**
     * Formats an array-shape key as a quoted string literal.
     *
     * @param key The key to format.
     */
    static formatKey(key) {
        return `'${PhpTypeGenerator.escape(key)}'`;
    }
    /**
     * Escapes a value to be used inside a single-quoted PHP string literal.
     *
     * @param value The value to escape.
     */
    static escape(value) {
        return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
}
exports.PhpTypeGenerator = PhpTypeGenerator;
/**
 * The canonicalizer options used for the canonical content shapes.
 */
PhpTypeGenerator.CANONICALIZER_OPTIONS = {
    prefix: '',
};
/**
 * The type used as the fallthrough content type for unknown keys.
 */
PhpTypeGenerator.UNKNOWN_CONTENT = 'array<string, mixed>';
