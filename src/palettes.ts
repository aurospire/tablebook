import { TableTheme } from "./tables";
import { TableDefinitionResolver } from "./tables";
import { ColorHex, Result } from "./util";

/**
 * Creates a four-shade color palette.
 * @param darkest - The darkest shade, used for `group.back`.
 * @param dark - A dark shade, used for `header.back`.
 * @param main - The main shade, used for `tab` and `color`.
 * @param lightest - The lightest shade, used for `data.back`.
 * @returns A palette object containing the four shades.
 */
const palette = (
    darkest: ColorHex,
    dark: ColorHex,
    main: ColorHex,
    lightest: ColorHex
): StandardPalette => ({ darkest, dark, main, lightest });

export type StandardPalette = {
    darkest: ColorHex;
    dark: ColorHex;
    main: ColorHex;
    lightest: ColorHex;
};

/**
 * Predefined color palettes for use in themes and references.
 * Includes shades of reds, oranges, yellows, greens, blues, purples, and neutrals.
 */
export const StandardPalettes = {
    // Reds
    pink: palette('#741F3F', '#C0315A', '#E84E76', '#FFD6E0'), // True rose pink
    cranberry: palette('#4C0D1C', '#721026', '#A31432', '#F4C2C9'), // Deep burgundy-cranberry
    red: palette('#660000', '#880000', '#C32222', '#F8C5C5'), // Classic red shades


    // Oranges and Yellows
    rust: palette('#8B3103', '#B54D18', '#D65C2B', '#F7D5BC'), // Deep orange-brown
    orange: palette('#783F04', '#B45F06', '#E6751A', '#FDD9BC'), // Bold orange shades
    yellow: palette('#856500', '#BF9000', '#E6AC1E', '#FFF2C4'), // Golden yellow tones


    // Greens
    green: palette('#294E13', '#38761D', '#4B9022', '#D6E8CE'), // Deep forest green
    moss: palette('#1E4D2B', '#3A7A47', '#519563', '#D4E8D1'), // Cool earthy green
    sage: palette('#38471F', '#596F34', '#788F4A', '#DCEADF'), // Muted green tones


    // Blues
    teal: palette('#004548', '#006E6E', '#008F8F', '#D1F0EC'), // Deep blue-green
    slate: palette('#2A4545', '#366060', '#507878', '#DEE8E8'), // Muted gray-blue
    cyan: palette('#0C343D', '#134F5C', '#1B657A', '#CBE5E8'), // Fresh blue-green
    blue: palette('#073763', '#0B5394', '#1763B8', '#CEE2F0'), // Classic blue shades
    azure: palette('#123A75', '#1E5BAA', '#2D70C8', '#D0E2F4'), // Bright sky blue
    skyblue: palette('#004080', '#0066CC', '#2E8FEA', '#D0E6F8'), // Light sky blue


    // Purples
    lavender: palette('#3F3677', '#5F51B7', '#776CCF', '#DAD5F2'), // Soft lavender tones
    indigo: palette('#20124D', '#351C75', '#483CA4', '#D5D0E3'), // Deep blue-purple
    purple: palette('#2D0A53', '#4B0082', '#6A0DAD', '#E6D5FF'), // Rich royal purple
    plum: palette('#4E1A45', '#6C3483', '#8E4FA8', '#E7D0EA'), // Warm purple-pink
    mauve: palette('#682F42', '#8D4659', '#A85475', '#F5D4DC'), // Dusky purple-pink


    // Neutrals    
    coral: palette('#762F2F', '#AF4A4A', '#D36868', '#FFE0DC'), // Warm reddish-pink
    terracotta: palette('#713F2D', '#9C5F4E', '#C87561', '#FAD9CE'), // Earthy orange-red
    bronze: palette('#5D4037', '#895D4D', '#A6705F', '#EAD6C7'), // Metallic brown
    sand: palette('#6A5D47', '#8C755D', '#B5937A', '#EDE0D2'), // Warm beige tones
    taupe: palette('#483C32', '#6B5D4F', '#857667', '#E5DBD1'), // Neutral brown-gray
    gray: palette('#3B3B3B', '#656565', '#7E7E7E', '#E8E8E8'), // Neutral gray shades
    charcoal: palette('#2A2A2A', '#4D4D4D', '#676767', '#E2E2E2'), // Deep gray tones
} as const;

export const StandardPaletteResolver: TableDefinitionResolver = {
    colors: (name) => {
        if (name in StandardPalettes) {
            const palette: StandardPalette = (StandardPalettes as any)[name];

            return Result.success(palette.main);
        }
        else {
            return Result.failure(`Standard color not found.`);
        }    
    },
    themes: (name) => {
        if (name in StandardPalettes) {
            const palette: StandardPalette = (StandardPalettes as any)[name];

            const theme: TableTheme = {
                tab: palette.main,
                group: { back: palette.darkest },
                header: { back: palette.dark },
                data: { back: palette.lightest },
            };

            return Result.success(theme);
        }
        else {
            return Result.failure(`Standard theme not found.`);
        }
    }
};