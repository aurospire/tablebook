// Defined More than once - but thats ok
export const ColorHexRegex = /^#[A-Za-z0-9]{6}$/;
export type ColorHex = `#${string}`;

export type ColorObject = { red: number; green: number; blue: number; };

const hexify = (value: number, digits: number): string => {
    return value.toString(16).padStart(digits, '0');
};

export const Colors = Object.freeze({
    toHex(object: ColorObject): ColorHex {
        return `#${hexify(object.red, 2)}${hexify(object.green, 2)}${hexify(object.blue, 2)}`;
    },
    toObject(hex: ColorHex): ColorObject {
        const red = Number.parseInt(hex.substring(1, 3), 16);
        const green = Number.parseInt(hex.substring(3, 5), 16);
        const blue = Number.parseInt(hex.substring(5, 7), 16);
        return { red, green, blue };
    },
    toWeighted(object: ColorObject): ColorObject {
        return {
            red: object.red / 255,
            green: object.green / 255,
            blue: object.blue / 255,
        };
    }
});