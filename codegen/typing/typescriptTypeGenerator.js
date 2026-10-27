"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptTypeGenerator = void 0;
const definition_1 = require("../../definition");
const codeWriter_1 = require("../codeWriter");
const version_1 = require("../../version");
const referenceCanonicalizer_1 = require("./referenceCanonicalizer");
var Dispatcher = definition_1.ContentDefinition.Dispatcher;
/**
 * TypeScript type generator.
 */
class TypescriptTypeGenerator extends Dispatcher {
    /**
     * Constructs a new instance.
     *
     * @param writer The code writer.
     * @param options The generator options.
     */
    constructor(writer, options = {}) {
        super();
        this.writer = writer ?? new codeWriter_1.CodeWriter();
        this.options = {
            ...options,
            discriminatorProperty: options.discriminatorProperty ?? '_type',
        };
    }
    visitBoolean() {
        this.writer.append('boolean');
    }
    visitNumber() {
        this.writer.append('number');
    }
    visitText(definition) {
        if (definition.choices !== undefined) {
            this.writer.append(`'${Object.keys(definition.choices).join("' | '")}'`);
            return;
        }
        this.writer.append('string');
    }
    static formatIdentifier(identifier) {
        return identifier.replace(/[^a-z0-9_$]+/gi, '_')
            .replace(/(^[a-z])|_([a-z])/gi, (_, first, second) => (first ?? second).toUpperCase());
    }
    visitList(definition, path) {
        this.writer.append('Array<');
        this.visit(definition.items, path);
        this.writer.append('>');
    }
    static wrapString(doc, maxLength) {
        return doc.replace(new RegExp(`(?![^\\n]{1,${maxLength}}$)([^\\n]{1,${maxLength}})\\s`, 'g'), '$1\n').split('\n');
    }
    visitUnion(definition, path) {
        const subtypes = Object.entries(definition.types);
        for (let index = 0; index < subtypes.length; index++) {
            const [discriminator, subtype] = subtypes[index];
            if (subtypes.length > 1 && index === 0) {
                this.writer
                    .indent()
                    .append('  ');
            }
            this.writer.append(`({'${this.options.discriminatorProperty}': '${discriminator}'} & `);
            this.visit(subtype, path);
            this.writer.append(')');
            if (index < subtypes.length - 1) {
                this.writer.newLine();
            }
            if (index !== subtypes.length - 1) {
                this.writer.append('| ');
            }
        }
        if (subtypes.length > 1) {
            this.writer.unindent();
        }
    }
    generate(collection) {
        const referenceMap = new Map();
        const canonicalizerOptions = {
            prefix: 'Def$',
        };
        function getReferenceId(definition) {
            return referenceCanonicalizer_1.ReferenceCanonicalizer.getReferenceId(definition, canonicalizerOptions);
        }
        const versionCache = new Map();
        function parseVersion(version) {
            let parsedVersion = versionCache.get(version);
            if (parsedVersion === undefined) {
                parsedVersion = version_1.Version.parse(version);
                versionCache.set(version, parsedVersion);
            }
            return parsedVersion;
        }
        for (const module of Object.values(collection)) {
            for (const definitionVersions of Object.values(module.definitions)) {
                for (const bundle of Object.values(definitionVersions)) {
                    const canonicalizedBundle = referenceCanonicalizer_1.ReferenceCanonicalizer.canonicalize(bundle, canonicalizerOptions);
                    const rootKey = getReferenceId(bundle.root);
                    if (!referenceMap.has(rootKey)) {
                        referenceMap.set(rootKey, canonicalizedBundle.root);
                    }
                    for (const [key, definition] of Object.entries(canonicalizedBundle.definitions)) {
                        if (!referenceMap.has(key)) {
                            referenceMap.set(key, definition);
                        }
                    }
                }
            }
        }
        let typeIndex = 0;
        for (const [key, definition] of referenceMap.entries()) {
            this.writeDocBlock(definition.title ?? '', definition.description ?? '');
            this.writer.append(`type ${key} = `);
            this.visit(definition);
            this.writer
                .append(';')
                .newLine();
            if (typeIndex++ < referenceMap.size - 1) {
                this.writer.newLine();
            }
        }
        this.writer.newLine();
        const modules = Object.entries(collection);
        for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
            const [moduleName, module] = modules[moduleIndex];
            this.writer
                .append(`declare module '${moduleName}' {`)
                .indent();
            for (const [id, definitionVersions] of Object.entries(module.definitions)) {
                for (const [version, { root, discriminator }] of Object.entries(definitionVersions)) {
                    this.writer
                        .append('type ')
                        .append(TypescriptTypeGenerator.formatIdentifier(id))
                        .append('V')
                        .append(TypescriptTypeGenerator.formatIdentifier(version))
                        .append(' = ')
                        .append(getReferenceId(root));
                    if (discriminator !== undefined && discriminator.values.length > 0) {
                        this.writer
                            .append(' & {')
                            .append(`'${discriminator.property}': `);
                        const values = [...new Set(discriminator.values)];
                        for (let index = 0; index < values.length; index++) {
                            const value = values[index];
                            this.writer.append(typeof value === 'string'
                                ? `'${value}'`
                                : `${value}`);
                            if (index < values.length - 1) {
                                this.writer.append(' | ');
                            }
                        }
                        this.writer.append('}');
                    }
                    this.writer
                        .append(';')
                        .newLine();
                }
            }
            this.writer
                .newLine()
                .append(`export interface ${module.mapName} {`)
                .indent();
            const definitions = Object.entries(module.definitions);
            for (let definitionIndex = 0; definitionIndex < definitions.length; definitionIndex++) {
                const [id, definitionVersions] = definitions[definitionIndex];
                const latestVersion = Object.keys(definitionVersions)
                    .sort((left, right) => version_1.Version.compareDescending(parseVersion(left), parseVersion(right)))[0];
                this.writer
                    .append(`'${id}': {`)
                    .indent();
                if (latestVersion !== undefined) {
                    this.writer
                        .append('latest: ')
                        .append(TypescriptTypeGenerator.formatIdentifier(id))
                        .append('V')
                        .append(TypescriptTypeGenerator.formatIdentifier(latestVersion))
                        .append(',')
                        .newLine();
                }
                const versions = Object.keys(definitionVersions);
                for (let versionIndex = 0; versionIndex < versions.length; versionIndex++) {
                    const version = versions[versionIndex];
                    this.writer
                        .append(`'${version}': `)
                        .append(TypescriptTypeGenerator.formatIdentifier(id))
                        .append('V')
                        .append(TypescriptTypeGenerator.formatIdentifier(version))
                        .append(',');
                    if (versionIndex < versions.length - 1) {
                        this.writer.newLine();
                    }
                }
                this.writer
                    .unindent()
                    .newLine()
                    .append('};');
                if (definitionIndex < definitions.length - 1) {
                    this.writer.newLine(2);
                }
            }
            this.writer
                .unindent()
                .newLine()
                .append('}')
                .unindent()
                .newLine()
                .append('}');
            if (moduleIndex < modules.length - 1) {
                this.writer.newLine(2);
            }
        }
        return this.writer.toString();
    }
    visitStructure(definition, path) {
        const attributes = Object.entries(definition.attributes);
        if (attributes.length === 0) {
            this.writer.append('Record<string, never>');
            return;
        }
        this.writer
            .append('{')
            .indent();
        for (let index = 0; index < attributes.length; index++) {
            const [name, attribute] = attributes[index];
            if (attribute.private === true) {
                continue;
            }
            this.writeDocBlock(attribute.label ?? attribute.type.title ?? '', attribute.description ?? attribute.type.description ?? '');
            this.writer
                .append(`'${name}'`)
                .append(attribute.optional === true ? '?' : '')
                .append(': ');
            this.visit(attribute.type, path.joinedWith([name]));
            this.writer.append(',');
            if (index < attributes.length - 1) {
                this.writer.newLine();
            }
        }
        this.writer
            .unindent()
            .newLine()
            .append('}');
    }
    visitReference({ id }) {
        this.writer.append(TypescriptTypeGenerator.formatIdentifier(id));
    }
    writeDocBlock(title, description, maxLength = 80) {
        const doc = `${title}\n${description}`.trim();
        if (doc === '') {
            return;
        }
        const lines = TypescriptTypeGenerator.wrapString(doc, maxLength);
        this.writer
            .append('/**')
            .newLine();
        for (let index = 0; index < lines.length; index++) {
            this.writer
                .append(' * ')
                .append(lines[index]);
            if (index === 0 && lines.length > 1) {
                this.writer
                    .newLine()
                    .append(' * ');
            }
            this.writer.newLine();
        }
        this.writer
            .append(' */')
            .newLine();
    }
}
exports.TypescriptTypeGenerator = TypescriptTypeGenerator;
