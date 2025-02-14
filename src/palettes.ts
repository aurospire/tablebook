import { TableDefinitionResolver, TableTheme } from "./tables";
import { ColorHex, Result } from "./util";

/**
 * Creates a five-shade color palette.
 * @param darkest - The darkest shade, used for `group.back`.
 * @param dark - A dark shade, used for `header.back`.
 * @param main - The base shade, used for `tab` and `color`.
 * @param light - A light shade, used for conditional styling.
 * @param lightest - The lightest shade, used for `data.back`.
 * @returns A palette object containing the five shades.
 */
const palette = (
    darkest: ColorHex,
    dark: ColorHex,
    base: ColorHex,
    light: ColorHex,
    lightest: ColorHex
): StandardPalette => ({ darkest, dark, base, light, lightest });

/**
 * Represents a five-shade color palette used for theming.
 */
export type StandardPalette = {
    /** The darkest shade, typically used for `group.back`. */
    darkest: ColorHex;
    /** A dark shade, typically used for `header.back`. */
    dark: ColorHex;
    /** The base shade, typically used for `tab` and `color`. */
    base: ColorHex;
    /** A light shade, typically used for conditional styling. */
    light: ColorHex;
    /** The lightest shade, typically used for `data.back`. */
    lightest: ColorHex;
};

/**
 * Predefined color palettes for use in themes and references.
 * Includes shades of reds, oranges, yellows, greens, blues, purples, and neutrals.
 */
export const StandardPalettes = {
    // Reds
    pink: palette('#741F3F', '#C0315A', '#E84E76', '#FFA3B9', '#FFD6E0'),
    cranberry: palette('#4C0D1C', '#721026', '#A31432', '#E6A1A9', '#F4C2C9'),
    red: palette('#660000', '#880000', '#C32222', '#F19999', '#F8C5C5'),

    // Oranges and Yellows
    rust: palette('#752203', '#993311', '#BD4022', '#E99275', '#F4C7B7'),       // More red-brown
    orange: palette('#8C4A04', '#C66A05', '#F08200', '#FFBB7F', '#FFE0C2'),     // More pure orange/golden
    yellow: palette('#856500', '#BF9000', '#E6AC1E', '#FFE494', '#FFF2C4'),

    // Greens
    green: palette('#294E13', '#38761D', '#4B9022', '#A7CF9B', '#D6E8CE'),
    forest: palette('#1D3B0A', '#2B5811', '#3B7517', '#9BCE8A', '#D4EBCB'),      // More saturated, darker
    sage: palette('#38471F', '#596F34', '#788F4A', '#B8CBA3', '#DCEADF'),       // Unchanged as reference
    moss: palette('#2E462D', '#445E3F', '#5A7752', '#A8BBA2', '#D9E3D6'),      // More gray-brown undertone

    // Blues
    slate: palette('#2A4545', '#366060', '#507878', '#AFC6C6', '#DEE8E8'),
    teal: palette('#004548', '#006E6E', '#008F8F', '#8CD1CD', '#D1F0EC'),
    cyan: palette('#0C343D', '#134F5C', '#1B657A', '#89BEC6', '#CBE5E8'),
    blue: palette('#042850', '#0A3D7D', '#1155AA', '#82B0E1', '#C7DEF2'),      // Deeper, more saturated
    azure: palette('#073763', '#0B5394', '#1763B8', '#8BB6DE', '#CEE2F0'),      
    //azure: palette('#193D66', '#275A88', '#3677AA', '#97BCE0', '#D2E4F2'),     // More gray undertone
    cerulean: palette('#005B99', '#0077CC', '#0095FF', '#99D6FF', '#CCE9FF'),  // Brighter, more cyan

    // Purples
    lavender: palette('#3F3677', '#5F51B7', '#776CCF', '#B5AAE6', '#DAD5F2'),
    indigo: palette('#20124D', '#351C75', '#483CA4', '#A69FC4', '#D5D0E3'),
    purple: palette('#2D0A53', '#4B0082', '#6A0DAD', '#B68EFF', '#E6D5FF'),
    plum: palette('#4E1A45', '#6C3483', '#8E4FA8', '#C69DD1', '#E7D0EA'),
    mauve: palette('#682F42', '#8D4659', '#A85475', '#E09FB0', '#F5D4DC'),

    // Neutrals    
    coral: palette('#762F2F', '#AF4A4A', '#D36868', '#FFB3AB', '#FFE0DC'),
    terracotta: palette('#713F2D', '#9C5F4E', '#C87561', '#F2AE9C', '#FAD9CE'),
    bronze: palette('#5D4037', '#895D4D', '#A6705F', '#D1B19E', '#EAD6C7'),
    sand: palette('#6A5D47', '#8C755D', '#B5937A', '#D9C2AB', '#EDE0D2'),
    taupe: palette('#483C32', '#6B5D4F', '#857667', '#C4B5A6', '#E5DBD1'),
    gray: palette('#3B3B3B', '#656565', '#7E7E7E', '#BFBFBF', '#E8E8E8'),
    charcoal: palette('#2A2A2A', '#4D4D4D', '#676767', '#B3B3B3', '#E2E2E2'),
} as const;


/**
 * Resolves standard color palettes and themes based on predefined configurations.
 *
 * This resolver provides color values and theme definitions based on named palettes
 * and colors. It allows retrieval of colors from standard palettes and generates
 * table themes accordingly.
 *
 * @param themes - Determines whether theme resolution is enabled.
 * @param colors - Determines whether color resolution is enabled.
 * @returns A `TableDefinitionResolver` containing color and theme resolution functions.
 */
export const StandardPaletteResolver = (
    themes: boolean,
    colors: boolean
): TableDefinitionResolver => ({
    /**
     * Resolves colors from predefined standard palettes.
     *
     * @remarks
     * - The expected format for `name` is `<palette>:<color>` (e.g., `"blue:darkest"`).
     * - If the `<color>` is omitted, the base color of the palette is used (e.g., `"blue"`).
     * - If the palette is valid but the color is not found, an error result is returned.
     * - If the palette itself is invalid, a failure result is returned.
     *
     * @param name - The name of the color in `<palette>:<color>` format.
     * @returns A `Result` object containing the resolved color or an error message.
     */
    colors: colors
        ? (name) => {
            const [palette, color] = name.split(':');

            if (palette in StandardPalettes) {
                const standardPalette: StandardPalette = (StandardPalettes as any)[palette];

                if (color) {
                    if (color in standardPalette) {
                        return Result.success((standardPalette as any)[color]);
                    } else {
                        return Result.failure(`Invalid color '${color}' for palette '${palette}'`);
                    }
                } else {
                    return Result.success(standardPalette.base);
                }
            } else {
                return Result.failure(undefined);
            }
        }
        : undefined,

    /**
     * Resolves a theme based on a standard palette.
     *
     * @remarks
     * - If the given `name` corresponds to a valid palette, a theme object is generated
     *   using predefined color mappings.
     * - The theme includes color values for tabs, groups, headers, and data elements.
     * - If the `name` is not a valid palette, a failure result is returned.
     *
     * @param name - The name of the palette.
     * @returns A `Result` object containing the resolved theme or an error.
     */
    themes: themes
        ? (name) => {
            if (name in StandardPalettes) {
                const palette: StandardPalette = (StandardPalettes as any)[name];

                const theme: TableTheme = {
                    tab: palette.base,
                    group: { back: palette.darkest },
                    header: { back: palette.dark },
                    data: { back: palette.lightest },
                };

                return Result.success(theme);
            } else {
                return Result.failure(undefined);
            }
        }
        : undefined,
});
