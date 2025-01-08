import { inspect } from 'util';
import { v } from 'varcor';
import { GoogleGenerator } from './google/GoogleGenerator';
import { GoogleSheet } from './google/GoogleSheet';
import { processTableBook } from './process';
import { SheetRange } from './sheets/SheetPosition';
import { TableBook } from './tables/types';
import { TableBookValidator } from './tables/validate';
import { Colors } from './util/Color';

const vars = v.values({
    email: v.string().email(),
    key: v.string(),
    sheetid: v.string()
}, v.data.jsonFile('.env.json').toDataObject());

console.log(vars);


const serialNumber = (datestring: `${string}-${string}-${string}`) => {
    // Ensure the input is a Date object
    const date = new Date(datestring);

    // Reference date for Google Sheets (December 30, 1899)
    const baseDate = new Date('1899-12-30T00:00:00Z');

    // Calculate the difference in milliseconds
    const timeDifference = date.getTime() - baseDate.getTime();

    // Convert milliseconds to days (1 day = 86,400,000 milliseconds)
    const days = timeDifference / (1000 * 60 * 60 * 24);

    // Return the serial number
    return days;
};


const testGoogleSheet = async () => {

    // const api = await GoogleSheetGenerator.login(vars.email, vars.key);

    // await GoogleSheetGenerator.resetBook(api, vars.sheetid);
    // const results = await GoogleSheetGenerator.getSheetIds(api, vars.sheetid);
    // console.log(results);

    const sheet = await GoogleSheet.open(vars.email, vars.key, vars.sheetid);

    await sheet.reset();


    const id = await sheet.addSheet({
        color: Colors.toObject('#990022'),
        rows: 10,
        columns: 10,
    });

    if (id) {
        await sheet.modify(r => r.mergeCells(id, SheetRange.region(3, 3)));

        await sheet.modify(r => r.setBorder(id, SheetRange.region(3, 3,), {
            top: { color: Colors.toObject('#ab2010'), type: 'dashed' },
            bottom: { color: Colors.toObject('#008800'), type: 'thick' },
            left: { color: Colors.toObject('#990022'), type: 'dotted' },
            right: { color: Colors.toObject('#8800AA'), type: 'double' },
        }));

        await sheet.modify(r => r.updateCells(id, SheetRange.cell(3, 3), { value: 10, bold: true, fore: Colors.toObject('#990022') }));
        await sheet.modify(r => r.updateCells(id, SheetRange.cell(3, 3), { value: 'hello\n\t"World"!' }));

        await sheet.modify(r => r
            .updateCells(id, SheetRange.cell(0, 0), { value: 10 })
            .updateCells(id, SheetRange.cell(0, 1), { value: 5 })
            .updateCells(id, SheetRange.cell(0, 2), {
                value: {
                    type: 'compound', with: '+', items: [
                        { type: 'selector', from: { start: { col: "$0", row: "$0" } } },
                        { type: 'selector', from: { start: { col: "$0", row: "$1" } } },
                    ]
                }
            })
            .updateCells(id, SheetRange.cell(0, 6), {
                value: serialNumber('2024-01-02'), type: 'time', format: [
                    { type: 'year', length: 'long' }, '-', { type: 'month', length: 'short' }, '-', { type: 'day', length: 'short' },
                    { type: 'weekday', length: 'long' }, ' | ', { type: 'hour', length: 'long' }, ':', { type: 'minute', length: 'long' }, { type: 'meridiem', length: 'long' }
                ]
            })
            .setDataValidation(id, SheetRange.column(1, 3, 2), { type: 'enum', values: ['Hello', 'Goodbye'] }, true)
            .setDataValidation(id, SheetRange.column(2, 3, 2), { type: '>', target: 'number', value: 5 }, false)
            .setConditionalFormat(id, SheetRange.column(2, 3, 2), { rule: { type: '=', target: 'number', value: 6 }, style: { fore: Colors.toObject('#FF0000'), bold: true } })
        );

        await sheet.modify(r => r.updateCells(id, SheetRange.region(1, 1, 2, 2), { back: Colors.toObject('#333333') }));
    }
};

const testTablebook = async (tablebook: TableBook) => {

    const result = TableBookValidator.safeParse(tablebook);
    if (result.success) {
        const sheet = await GoogleSheet.open(vars.email, vars.key, vars.sheetid);

        const generator = new GoogleGenerator(sheet);

        const sheetbook = processTableBook(result.data);

        await generator.generate(sheetbook);

        // console.log(inspect(sheetbook, { depth: null, colors: true }));
    }
    else {
        console.log('Tablebook validation failed');
        console.log(inspect(result.error, { depth: null, colors: true }));
    }
};

const tablebook: TableBook = {
    name: "QuarterlyBusinessReport",
    theme: "@business",
    definitions: {
        colors: {
            headerBlue: "#2C5282",
            lightBlue: "#EBF8FF",
            successGreen: "#48BB78",
            warningRed: "#F56565",
            neutral: "#718096",
            border: '#000000'            
        },
        styles: {
            group: {
                fore: '#ffffff',
                form: { bold: true },
                beneath: { type: 'medium', color: '@border' },
                between: { type: 'medium', color: '@border' }
            },
            header: {
                fore: '#ffffff',
                form: { bold: true },
                beneath: { type: 'dotted', color: '@border' },
                between: { type: 'dotted', color: '@border' }
            },
            data: {
                fore: '#000000',
                form: false
            },
            success: {
                fore: "@successGreen",
                form: { bold: true }
            },
            warning: {
                fore: "@warningRed",
                form: { bold: true }
            }
        },
        themes: {
            business: {
                group: "@group",
                header: "@header",
                data: "@data"
            },
            one: '@blue',
            two: '@slate',
            three: '@cyan'

        },
        formats: {
            numeric: {
                currency: {
                    type: "currency",
                    integer: { fixed: 1, align: 3 },
                    decimal: { fixed: 2 },
                    symbol: "$",
                    position: "prefix",
                    commas: true
                },
                percent: {
                    type: "percent",
                    integer: { fixed: 2 },
                    decimal: { fixed: 1 }
                }
            },
            temporal: {
                shortDate: [
                    { type: "year", length: "short" },
                    "-",
                    { type: "month", length: "short" },
                    "-",
                    { type: "day", length: "short" }
                ]
            }
        },
        types: {
            money: {
                name: "numeric",
                format: "@currency",
                styles: [
                    {
                        on: { type: "<", to: 0 },
                        style: "@warning"
                    },
                    {
                        on: { type: ">", to: 1000000 },
                        style: "@success"
                    }
                ]
            }
        }
    },
    pages: [
        {
            name: "FinancialSummary",
            theme: '@blue',
            rows: 12,
            groups: [
                {
                    name: "Revenue",
                    theme: '@one',
                    columns: [
                        {
                            name: "Month",
                            type: {
                                name: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "GrossRevenue",
                            type: "@money",
                            description: "Total revenue before deductions"
                        },
                        {
                            name: "Deductions",
                            type: "@money",
                            description: "Returns, discounts, and allowances"
                        },
                        {
                            name: "NetRevenue",
                            type: "@money",
                            expression: {
                                type: "compound",
                                with: "-",
                                items: [
                                    {
                                        type: "selector",
                                        from: { column: { name: "GrossRevenue" } }
                                    },
                                    {
                                        type: "selector",
                                        from: { column: { name: "Deductions" } }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    name: "Expenses",
                    theme: '@two',
                    columns: [
                        {
                            name: "Month",
                            type: {
                                name: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "OperatingExpenses",
                            type: "@money"
                        },
                        {
                            name: "AdminExpenses",
                            type: "@money"
                        },
                        {
                            name: "MarketingExpenses",
                            type: "@money"
                        },
                        {
                            name: "TotalExpenses",
                            type: "@money",
                            expression: {
                                type: "compound",
                                with: "+",
                                items: [
                                    {
                                        type: "selector",
                                        from: { column: { name: "OperatingExpenses" } }
                                    },
                                    {
                                        type: "selector",
                                        from: { column: { name: "AdminExpenses" } }
                                    },
                                    {
                                        type: "selector",
                                        from: { column: { name: "MarketingExpenses" } }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    name: "Profitability",
                    theme: '@three',
                    columns: [
                        {
                            name: "Month",
                            type: {
                                name: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "GrossProfit",
                            type: "@money",
                            expression: {
                                type: "selector",
                                from: {
                                    column: { group: "Revenue", name: "NetRevenue" }
                                }
                            }
                        },
                        {
                            name: "NetProfit",
                            type: "@money",
                            expression: {
                                type: "compound",
                                with: "-",
                                items: [
                                    {
                                        type: "selector",
                                        from: { column: { name: "GrossProfit" } }
                                    },
                                    {
                                        type: "selector",
                                        from: {
                                            column: { group: "Expenses", name: "TotalExpenses" }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "ProfitMargin",
                            type: {
                                name: "numeric",
                                format: "@percent",
                                rule: {
                                    type: "between",
                                    low: 0,
                                    high: 100
                                }
                            },
                            expression: {
                                type: "compound",
                                with: "/",
                                items: [
                                    {
                                        type: "selector",
                                        from: { column: { name: "NetProfit" } }
                                    },
                                    {
                                        type: "selector",
                                        from: {
                                            column: { group: "Revenue", name: "NetRevenue" }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "OperationalMetrics",
            rows: 12,
            theme: '@green',
            groups: [
                {
                    name: "CustomerMetrics",
                    columns: [
                        {
                            name: "Month",
                            type: {
                                name: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "NewCustomers",
                            type: {
                                name: "numeric",
                                format: {
                                    type: "number",
                                    integer: { fixed: 1, align: 3 },
                                    decimal: { fixed: 0 },
                                    commas: true
                                }
                            }
                        },
                        {
                            name: "ChurnRate",
                            type: {
                                name: "numeric",
                                format: "@percent",
                                rule: {
                                    type: "between",
                                    low: 0,
                                    high: 100
                                },
                                styles: [
                                    {
                                        on: { type: ">", to: 5 },
                                        style: "@warning"
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    name: "ProductivityMetrics",
                    columns: [
                        {
                            name: "Month",
                            type: {
                                name: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "EmployeeCount",
                            type: {
                                name: "numeric",
                                format: {
                                    type: "number",
                                    integer: { fixed: 1, align: 3 },
                                    decimal: { fixed: 0 },
                                    commas: true
                                }
                            }
                        },
                        {
                            name: "RevenuePerEmployee",
                            type: "@money",
                            expression: {
                                type: "compound",
                                with: "/",
                                items: [
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                table: "FinancialSummary",
                                                group: "Revenue",
                                                name: "NetRevenue"
                                            }
                                        }
                                    },
                                    {
                                        type: "selector",
                                        from: { column: { name: "EmployeeCount" } }
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ]
};

testTablebook(tablebook);