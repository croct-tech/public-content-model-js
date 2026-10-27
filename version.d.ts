/**
 * The parts that make up the version number.
 */
export type VersionParts = {
    /**
     * The major version number.
     */
    major: number;
    /**
     * The minor version number.
     */
    minor?: number;
};
/**
 * An immutable object value representing a semantic version.
 *
 * @see https://semver.org/
 */
export declare class Version {
    /**
     * A pattern that matches a valid version string.
     */
    static readonly PATTERN: RegExp;
    /**
     * The major version number.
     */
    readonly major: number;
    /**
     * The minor version number.
     */
    readonly minor: number;
    /**
     * Constructs a new instance.
     *
     * @param major The major version number.
     * @param minor The minor version number.
     */
    private constructor();
    /**
     * Creates a new version object from the given parts.
     *
     * @param parts The parts of the version.
     *
     * @returns The version with the given parts.
     *
     * @throws {Error} If either the major or minor version number are either non-integers or
     * negative.
     */
    static fromParts({ major, minor }: VersionParts): Version;
    /**
     * Parses the given string into a version object.
     *
     * @param version The string to parse.
     *
     * @returns The parsed version.
     *
     * @throws {Error} If the string is not a valid version.
     */
    static parse(version: string): Version;
    /**
     * Tests whether the version string is valid.
     */
    static isValid(version: string): boolean;
    /**
     * Returns the latest of the two given versions.
     *
     * @param left The left version.
     * @param right The right version.
     *
     * @returns The latest of the two given versions.
     */
    static latest(left: Version, right: Version): Version;
    /**
     * Returns the earliest of the two given versions.
     *
     * @param left The left version.
     * @param right The right version.
     *
     * @returns The earliest of the two given versions.
     */
    static earliest(left: Version, right: Version): Version;
    /**
     * Compares two versions for ascending ordering.
     *
     * @param left The first version to compare.
     * @param right The second version to compare.
     *
     * @returns `-1` if the first version is prior to the second one,
     * `0` if they are equal, `1` if the first version is after the second one.
     */
    static compareAscending(left: Version, right: Version): number;
    /**
     * Compares two versions for descending ordering.
     *
     * @param left The first version to compare.
     * @param right The second version to compare.
     *
     * @returns `1` if the first version is prior to the second one,
     * `0` if they are equal, `-1` if the first version is after the second one.
     */
    static compareDescending(left: Version, right: Version): number;
    /**
     * Returns the next major version.
     */
    bumpMajor(): Version;
    /**
     * Returns the next minor version.
     */
    bumpMinor(): Version;
    /**
     * Checks whether the major version is equal to the given one.
     *
     * @param other The other version to compare.
     *
     * @returns `true` if the major version is equal to the given one, `false` otherwise.
     */
    isCompatibleWith(other: Version): boolean;
    /**
     * Compares this version to the given one for ordering.
     *
     * @param other The other version to compare.
     *
     * @returns `-1` if this version is prior to the given one,
     * `0` if they are equal, `1` if this version is after the given one.
     */
    compare(other: Version): number;
    /**
     * Returns the parts that make up this version.
     */
    toParts(): Required<VersionParts>;
    /**
     * Returns the JSON representation of this version.
     */
    toJSON(): Required<VersionParts>;
    /**
     * Returns the string representation of this version.
     */
    toString(): string;
}
