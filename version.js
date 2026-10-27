"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
/**
 * An immutable object value representing a semantic version.
 *
 * @see https://semver.org/
 */
class Version {
    /**
     * Constructs a new instance.
     *
     * @param major The major version number.
     * @param minor The minor version number.
     */
    constructor(major, minor) {
        this.major = major;
        this.minor = minor;
    }
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
    static fromParts({ major, minor = 0 }) {
        if (!Number.isSafeInteger(major) || major < 0) {
            throw new Error('The major part must be an integer greater than or equal to 0');
        }
        if (!Number.isSafeInteger(minor) || minor < 0) {
            throw new Error('The minor part must be an integer greater than or equal to 0');
        }
        return new Version(major, minor);
    }
    /**
     * Parses the given string into a version object.
     *
     * @param version The string to parse.
     *
     * @returns The parsed version.
     *
     * @throws {Error} If the string is not a valid version.
     */
    static parse(version) {
        const match = version.match(Version.PATTERN);
        if (match === null) {
            throw new Error(`Malformed version string '${version}'.`);
        }
        const [, major, minor = '0'] = match;
        return Version.fromParts({
            major: parseInt(major, 10),
            minor: parseInt(minor, 10),
        });
    }
    /**
     * Tests whether the version string is valid.
     */
    static isValid(version) {
        return version.match(Version.PATTERN) !== null;
    }
    /**
     * Returns the latest of the two given versions.
     *
     * @param left The left version.
     * @param right The right version.
     *
     * @returns The latest of the two given versions.
     */
    static latest(left, right) {
        return left.compare(right) > 0 ? left : right;
    }
    /**
     * Returns the earliest of the two given versions.
     *
     * @param left The left version.
     * @param right The right version.
     *
     * @returns The earliest of the two given versions.
     */
    static earliest(left, right) {
        return left.compare(right) < 0 ? left : right;
    }
    /**
     * Compares two versions for ascending ordering.
     *
     * @param left The first version to compare.
     * @param right The second version to compare.
     *
     * @returns `-1` if the first version is prior to the second one,
     * `0` if they are equal, `1` if the first version is after the second one.
     */
    static compareAscending(left, right) {
        return left.compare(right);
    }
    /**
     * Compares two versions for descending ordering.
     *
     * @param left The first version to compare.
     * @param right The second version to compare.
     *
     * @returns `1` if the first version is prior to the second one,
     * `0` if they are equal, `-1` if the first version is after the second one.
     */
    static compareDescending(left, right) {
        return right.compare(left);
    }
    /**
     * Returns the next major version.
     */
    bumpMajor() {
        return new Version(this.major + 1, 0);
    }
    /**
     * Returns the next minor version.
     */
    bumpMinor() {
        return new Version(this.major, this.minor + 1);
    }
    /**
     * Checks whether the major version is equal to the given one.
     *
     * @param other The other version to compare.
     *
     * @returns `true` if the major version is equal to the given one, `false` otherwise.
     */
    isCompatibleWith(other) {
        return this.major === other.major;
    }
    /**
     * Compares this version to the given one for ordering.
     *
     * @param other The other version to compare.
     *
     * @returns `-1` if this version is prior to the given one,
     * `0` if they are equal, `1` if this version is after the given one.
     */
    compare(other) {
        if (this.major !== other.major) {
            return this.major - other.major;
        }
        return this.minor - other.minor;
    }
    /**
     * Returns the parts that make up this version.
     */
    toParts() {
        return {
            major: this.major,
            minor: this.minor,
        };
    }
    /**
     * Returns the JSON representation of this version.
     */
    toJSON() {
        return this.toParts();
    }
    /**
     * Returns the string representation of this version.
     */
    toString() {
        return `${this.major}.${this.minor}`;
    }
}
exports.Version = Version;
/**
 * A pattern that matches a valid version string.
 */
Version.PATTERN = /^(\d+)(?:\.(\d+))?$/;
