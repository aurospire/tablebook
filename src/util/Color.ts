// Defined More than once - but that's ok
export const ColorHexRegex = /^#[A-Za-z0-9]{6}$/;

/** Represents a hex color code in the format `#RRGGBB`. */
export type ColorHex = `#${string}`;

/** Represents a color as an object with red, green, and blue values (0-255). */
export type ColorObject = { red: number; green: number; blue: number; };

/**
 * Converts a numeric value to a hex string of a specified length.
 * @param value - The number to convert to hex.
 * @param digits - The desired length of the hex string.
 * @returns The hex string representation of the number.
 */
const hexify = (value: number, digits: number): string => {
    return value.toString(16).padStart(digits, '0');
};

/**
 * Utility for color conversions between hex strings and objects.
 */
export const Colors = Object.freeze({
    /**
     * Converts a `ColorObject` to a `ColorHex`.
     * @param object - The color represented as an object with red, green, and blue values.
     * @returns The color in `#RRGGBB` format.
     */
    toHex(object: ColorObject): ColorHex {
        return `#${hexify(object.red, 2)}${hexify(object.green, 2)}${hexify(object.blue, 2)}`;
    },

    /**
     * Converts a `ColorHex` to a `ColorObject`.
     * @param hex - The color in `#RRGGBB` format.
     * @returns The color as an object with red, green, and blue values.
     */
    toObject(hex: ColorHex): ColorObject {
        const red = Number.parseInt(hex.substring(1, 3), 16);
        const green = Number.parseInt(hex.substring(3, 5), 16);
        const blue = Number.parseInt(hex.substring(5, 7), 16);
        return { red, green, blue };
    },

    /**
     * Converts a `ColorObject` to a weighted format where each value is normalized to the range [0, 1].
     * @param object - The color represented as an object with red, green, and blue values (0-255).
     * @returns The color as an object with normalized values.
     */
    toWeighted(object: ColorObject): ColorObject {
        return {
            red: object.red / 255,
            green: object.green / 255,
            blue: object.blue / 255,
        };
    },
});
