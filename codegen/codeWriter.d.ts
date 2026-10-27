/**
 * The code style definition.
 */
export type CodeStyle = {
    /**
     * The number of spaces to indent per level.
     */
    indentSize: number;
};
/**
 * A string builder with basic code writing capabilities.
 */
export declare class CodeWriter {
    /**
     * The code style.
     */
    readonly style: Readonly<CodeStyle>;
    /**
     * The current indentation level.
     */
    private indentLevel;
    /**
     * The current code.
     */
    private output;
    /**
     * Initializes a new instance.
     *
     * @param style The code style.
     */
    constructor(style?: Partial<CodeStyle>);
    /**
     * Appends a fragment to the end of the current line.
     *
     * @param fragment The fragment to append.
     */
    append(fragment: string): this;
    /**
     * Appends the given number of line breaks to the end of the current line.
     *
     * @param count The number of line breaks to append.
     */
    newLine(count?: number): this;
    /**
     * Increases the indentation level by the given amount.
     *
     * @param level The number of levels to increase.
     */
    indent(level?: number): this;
    /**
     * Decreases the indentation level by the given amount.
     *
     * @param level The number of levels to decrease.
     */
    unindent(level?: number): this;
    /**
     * Gets the current code.
     */
    toString(): string;
}
