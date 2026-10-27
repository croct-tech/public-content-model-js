"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeWriter = void 0;
/**
 * A string builder with basic code writing capabilities.
 */
class CodeWriter {
    /**
     * Initializes a new instance.
     *
     * @param style The code style.
     */
    constructor(style = {}) {
        /**
         * The current indentation level.
         */
        this.indentLevel = 0;
        /**
         * The current code.
         */
        this.output = '';
        this.style = {
            indentSize: style.indentSize ?? 2,
        };
    }
    /**
     * Appends a fragment to the end of the current line.
     *
     * @param fragment The fragment to append.
     */
    append(fragment) {
        this.output += fragment;
        return this;
    }
    /**
     * Appends the given number of line breaks to the end of the current line.
     *
     * @param count The number of line breaks to append.
     */
    newLine(count = 1) {
        return this.append('\n'.repeat(count))
            .append(' '.repeat(this.indentLevel * this.style.indentSize));
    }
    /**
     * Increases the indentation level by the given amount.
     *
     * @param level The number of levels to increase.
     */
    indent(level = 1) {
        this.indentLevel = Math.max(this.indentLevel + level, 0);
        return this.newLine();
    }
    /**
     * Decreases the indentation level by the given amount.
     *
     * @param level The number of levels to decrease.
     */
    unindent(level = 1) {
        this.indentLevel = Math.max(this.indentLevel - level, 0);
        return this;
    }
    /**
     * Gets the current code.
     */
    toString() {
        return this.output;
    }
}
exports.CodeWriter = CodeWriter;
