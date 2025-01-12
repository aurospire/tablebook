import { inspect } from "util";
import { SheetData } from "../sheets/SheetData";
import { SheetRange } from "../sheets/SheetPosition";
import { SheetConditionalStyle, SheetRule } from "../sheets/SheetRule";
import { SheetBorderSet } from "../sheets/SheetStyle";
import { getFields, toCellFormat, toCellValue } from "./GoogleCellData";
import { toGoogleCondition } from "./GoogleCondition";
import { toGridRange } from "./GoogleGridRange";
import { toSheetsBorder, toWeightedColorStyle } from "./GoogleStyles";
import { GoogleAddSheetOptions, GoogleAddSheetReply, GoogleApi, GoogleReply, GoogleRequest } from "./GoogleTypes";

export type GoogleReplyProcessor<Reply = GoogleReply> = (reply: Reply | undefined) => void;

export class GoogleRequester {
    #requests: GoogleRequest[];
    #processors: GoogleReplyProcessor[];

    constructor(requests: GoogleRequest[] = [], processors: GoogleReplyProcessor[] = []) {
        this.#requests = requests;
        this.#processors = processors;
    }

    do(requests: GoogleRequest | GoogleRequest[], process?: GoogleReplyProcessor) {
        process ??= () => { };

        const newRequests = Array.isArray(requests) ? requests : [requests];

        const newProcessors = Array.isArray(requests) ? Array(requests.length).fill(process) : [process];

        return new GoogleRequester(
            [...this.#requests, ...newRequests],
            [...this.#processors, ...newProcessors]
        );
    }

    setTitle(title: string, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({
            updateSpreadsheetProperties: {
                properties: { title },
                fields: 'title',
            }
        }, process);
    }

    addSheet(options: GoogleAddSheetOptions, process?: (reply?: GoogleAddSheetReply, id?: number) => void): GoogleRequester {
        return this.do(
            {
                addSheet: {
                    properties: {
                        sheetId: options.id,
                        title: options.title,
                        tabColorStyle: toWeightedColorStyle(options.color),
                        gridProperties: { columnCount: options.columns, rowCount: options.rows }
                    }
                }
            },
            (reply) => { process?.(reply?.addSheet, reply?.addSheet?.properties?.sheetId ?? undefined); }
        );
    }

    dropSheets(ids: number | number[], process?: GoogleReplyProcessor): GoogleRequester {
        return this.do((Array.isArray(ids) ? ids : [ids]).map(id => ({ deleteSheet: { sheetId: id } }), process));
    }

    mergeCells(sheetId: number, range: SheetRange, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({ mergeCells: { range: toGridRange(sheetId, range) } }, process);
    }

    setBorder(sheetId: number, range: SheetRange, borders: SheetBorderSet, process?: GoogleReplyProcessor): GoogleRequester {
        return this.do({
            updateBorders: {
                range: toGridRange(sheetId, range),
                top: toSheetsBorder(borders.top),
                bottom: toSheetsBorder(borders.bottom),
                left: toSheetsBorder(borders.left),
                right: toSheetsBorder(borders.right),
            }
        }, process);
    }

    updateCells(sheetId: number, range: SheetRange, data: SheetData, process?: GoogleReplyProcessor): GoogleRequester {
        const fields: string[] = getFields(data);
        const format = toCellFormat(data);
        const value = toCellValue(data, range.from);

        if (fields.length)
            return this.do({
                repeatCell: {
                    range: toGridRange(sheetId, range),
                    cell: {
                        userEnteredValue: value,
                        userEnteredFormat: format
                    },
                    fields: fields.join(',')
                }
            }, process);

        return this;
    }

    setDataValidation(sheetId: number, range: SheetRange, rule: SheetRule, strict: boolean): GoogleRequester {
        return this.do({
            setDataValidation: {
                range: toGridRange(sheetId, range),
                rule: {
                    condition: toGoogleCondition(rule, range.from, true),
                    strict,
                    showCustomUi: rule.type === 'enum' || rule.type === 'lookup',
                }
            }
        });
    }

    setConditionalFormat(sheetId: number, range: SheetRange, format: SheetConditionalStyle): GoogleRequester {
        return this.do({
            addConditionalFormatRule: {
                rule: {
                    ranges: [toGridRange(sheetId, range)],
                    booleanRule: {
                        condition: toGoogleCondition(format.rule, range.from, false),
                        format: toCellFormat(format.apply)
                    }
                }
            }
        });
    }


    async run(api: GoogleApi, id: string) {
        const result = await api.spreadsheets.batchUpdate({
            spreadsheetId: id,
            requestBody: {
                requests: this.#requests
            }
        });

        const replies = result.data.replies ?? [];

        for (let i = 0; i < this.#processors.length; i++)
            this.#processors[i](replies[i]);

        if (result.status > 300) {
            console.error(result);
            console.error(inspect(result.data, { depth: null, colors: true }));
        }
        return result;
    }
}


