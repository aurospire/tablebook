import { HexColor } from "../types/types";

export type Color = { red: number; green: number; blue: number; };


export const hexify = (value: number, digits: number): string => {
    return value.toString(16).padStart(digits, '0');
};

export const Color = Object.freeze({
    toHex(color: Color): HexColor {
        return `#${hexify(color.red, 2)}${hexify(color.green, 2)}${hexify(color.blue, 2)}`;
    },
    fromHex(hex: HexColor): Color {
        const red = Number.parseInt(hex.substring(1, 3), 16);
        const green = Number.parseInt(hex.substring(3, 5), 16);
        const blue = Number.parseInt(hex.substring(5, 7), 16);

        return { red, green, blue };
    }
});