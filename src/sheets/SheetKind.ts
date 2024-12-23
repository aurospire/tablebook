import { NumericFormat } from "../tables/types";


export type SheetType = 'text' | 'number' | 'percent' | 'currency' | 'date' | 'time' | 'datetime';

export type SheetKind = {
    type?: SheetType | null;
    format?: NumericFormat | null;
};


export const toPattern = (format: NumericFormat): string => {

    switch (format.)
};