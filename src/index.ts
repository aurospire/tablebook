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
                        { type: 'selector', from: { from: { col: "$0", row: "$0" } } },
                        { type: 'selector', from: { from: { col: "$0", row: "$1" } } },
                    ]
                }
            })
            .updateCells(id, SheetRange.cell(0, 6), {
                value: serialNumber('2024-01-02'), kind: 'time', format: [
                    { type: 'year', length: 'long' }, '-', { type: 'month', length: 'short' }, '-', { type: 'day', length: 'short' },
                    { type: 'weekday', length: 'long' }, ' | ', { type: 'hour', length: 'long' }, ':', { type: 'minute', length: 'long' }, { type: 'meridiem', length: 'long' }
                ]
            })
            .setDataValidation(id, SheetRange.column(1, 3, 2), { type: 'enum', values: ['Hello', 'Goodbye'] }, true)
            .setDataValidation(id, SheetRange.column(2, 3, 2), { type: '>', target: 'number', value: 5 }, false)
            .setConditionalFormat(id, SheetRange.column(2, 3, 2), { rule: { type: '=', target: 'number', value: 6 }, apply: { fore: Colors.toObject('#FF0000'), bold: true } })
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

const tablebook0: TableBook = {
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
                bold: true,
                beneath: { type: 'medium', color: '@border' },
                between: { type: 'medium', color: '@border' }
            },
            header: {
                fore: '#ffffff',
                bold: true,
                beneath: { type: 'dotted', color: '@border' },
                between: { type: 'dotted', color: '@border' }
            },
            data: {
                fore: '#000000',
                bold: false
            },
            success: {
                fore: "@successGreen",
                bold: true
            },
            warning: {
                fore: "@warningRed",
                bold: true
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
                kind: "numeric",
                format: "@currency",
                styles: [
                    {
                        rule: { type: "<", value: 0 },
                        apply: "@warning"
                    },
                    {
                        rule: { type: ">", value: 1000000 },
                        apply: "@success"
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
                                kind: "temporal",
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
                                kind: "temporal",
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
                                kind: "temporal",
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
                                kind: "numeric",
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
                                kind: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "NewCustomers",
                            type: {
                                kind: "numeric",
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
                                kind: "numeric",
                                format: "@percent",
                                rule: {
                                    type: "between",
                                    low: 0,
                                    high: 100
                                },
                                styles: [
                                    {
                                        rule: { type: ">", value: 5 },
                                        apply: "@warning"
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
                                kind: "temporal",
                                format: "@shortDate"
                            }
                        },
                        {
                            name: "EmployeeCount",
                            type: {
                                kind: "numeric",
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
                                                page: "FinancialSummary",
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

const tablebook1: TableBook = {
    name: "PaletteLibrary",
    theme: {
        group: {
            fore: "#ffffff",
            bold: true,
        },
        header: {
            fore: "#ffffff",
            bold: true,
        }
    },
    pages: [
        {
            name: "AllPalettes",
            rows: 10,
            groups: [
                {
                    name: "PinkFamily",
                    theme: "@pink",
                    columns: [{ name: "Pink", type: { kind: "text" } }]
                },
                {
                    name: "CranberryFamily",
                    theme: "@cranberry",
                    columns: [{ name: "Cranberry", type: { kind: "text" } }]
                },
                {
                    name: "RedFamily",
                    theme: "@red",
                    columns: [{ name: "Red", type: { kind: "text" } }]
                },
                {
                    name: "RustFamily",
                    theme: "@rust",
                    columns: [{ name: "Rust", type: { kind: "text" } }]
                },
                {
                    name: "OrangeFamily",
                    theme: "@orange",
                    columns: [{ name: "Orange", type: { kind: "text" } }]
                },
                {
                    name: "YellowFamily",
                    theme: "@yellow",
                    columns: [{ name: "Yellow", type: { kind: "text" } }]
                },
                {
                    name: "GreenFamily",
                    theme: "@green",
                    columns: [{ name: "Green", type: { kind: "text" } }]
                },
                {
                    name: "MossFamily",
                    theme: "@moss",
                    columns: [{ name: "Moss", type: { kind: "text" } }]
                },
                {
                    name: "SageFamily",
                    theme: "@sage",
                    columns: [{ name: "Sage", type: { kind: "text" } }]
                },
                {
                    name: "TealFamily",
                    theme: "@teal",
                    columns: [{ name: "Teal", type: { kind: "text" } }]
                },
                {
                    name: "SlateFamily",
                    theme: "@slate",
                    columns: [{ name: "Slate", type: { kind: "text" } }]
                },
                {
                    name: "CyanFamily",
                    theme: "@cyan",
                    columns: [{ name: "Cyan", type: { kind: "text" } }]
                },
                {
                    name: "BlueFamily",
                    theme: "@blue",
                    columns: [{ name: "Blue", type: { kind: "text" } }]
                },
                {
                    name: "AzureFamily",
                    theme: "@azure",
                    columns: [{ name: "Azure", type: { kind: "text" } }]
                },
                {
                    name: "SkyblueFamily",
                    theme: "@skyblue",
                    columns: [{ name: "Skyblue", type: { kind: "text" } }]
                },
                {
                    name: "LavenderFamily",
                    theme: "@lavender",
                    columns: [{ name: "Lavender", type: { kind: "text" } }]
                },
                {
                    name: "IndigoFamily",
                    theme: "@indigo",
                    columns: [{ name: "Indigo", type: { kind: "text" } }]
                },
                {
                    name: "PurpleFamily",
                    theme: "@purple",
                    columns: [{ name: "Purple", type: { kind: "text" } }]
                },
                {
                    name: "PlumFamily",
                    theme: "@plum",
                    columns: [{ name: "Plum", type: { kind: "text" } }]
                },
                {
                    name: "MauveFamily",
                    theme: "@mauve",
                    columns: [{ name: "Mauve", type: { kind: "text" } }]
                },
                {
                    name: "CoralFamily",
                    theme: "@coral",
                    columns: [{ name: "Coral", type: { kind: "text" } }]
                },
                {
                    name: "TerracottaFamily",
                    theme: "@terracotta",
                    columns: [{ name: "Terracotta", type: { kind: "text" } }]
                },
                {
                    name: "BronzeFamily",
                    theme: "@bronze",
                    columns: [{ name: "Bronze", type: { kind: "text" } }]
                },
                {
                    name: "SandFamily",
                    theme: "@sand",
                    columns: [{ name: "Sand", type: { kind: "text" } }]
                },
                {
                    name: "TaupeFamily",
                    theme: "@taupe",
                    columns: [{ name: "Taupe", type: { kind: "text" } }]
                },
                {
                    name: "GrayFamily",
                    theme: "@gray",
                    columns: [{ name: "Gray", type: { kind: "text" } }]
                },
                {
                    name: "CharcoalFamily",
                    theme: "@charcoal",
                    columns: [{ name: "Charcoal", type: { kind: "text" } }]
                }
            ]
        }
    ]
};

const tablebook2: TableBook = {
    name: "ExpressionTest",
    theme: "@business",
    definitions: {
        colors: {
            primaryBack: "#f5f5f5",
            primaryFore: "#333333",
            highlightBack: "#e3f2fd",
        },
        formats: {
            numeric: {
                money: {
                    type: "currency",
                    integer: { fixed: 1 },
                    decimal: { fixed: 2 },
                    symbol: "$",
                    position: "prefix"
                },
                percent: {
                    type: "percent",
                    integer: { fixed: 1 },
                    decimal: { fixed: 1 }
                }
            }
        },
        themes: {
            business: {
                tab: "@blue",
                header: {
                    fore: "#ffffff",
                    back: "@blue",
                    bold: true,
                    beneath: {
                        type: "thin",
                        color: "@blue"
                    }
                },
                data: {
                    fore: "@primaryFore",
                    back: "@primaryBack"
                }
            }
        }
    },
    pages: [
        {
            name: "Calculations",
            rows: 10,
            groups: [
                {
                    name: "BasicInputs",
                    columns: [
                        {
                            name: "Quantity",
                            type: {
                                kind: "numeric",
                                rule: {
                                    type: ">=",
                                    value: 0
                                }
                            }
                        },
                        {
                            name: "UnitPrice",
                            type: {
                                kind: "numeric",
                                format: "@money",
                                rule: {
                                    type: ">",
                                    value: 0
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Computations",
                    columns: [
                        {
                            name: "Revenue",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "*",
                                items: [
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "BasicInputs",
                                                name: "Quantity"
                                            },
                                            row: "self"
                                        }
                                    },
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "BasicInputs",
                                                name: "UnitPrice"
                                            },
                                            row: "self"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "Discount",
                            type: {
                                kind: "numeric",
                                format: "@percent"
                            },
                            expression: {
                                type: "function",
                                name: "if",
                                args: [
                                    {
                                        type: "compound",
                                        with: ">=",
                                        items: [
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "BasicInputs",
                                                        name: "Quantity"
                                                    },
                                                    row: "self"
                                                }
                                            },
                                            {
                                                type: "literal",
                                                of: 5
                                            }
                                        ]
                                    },
                                    {
                                        type: "literal",
                                        of: 0.1
                                    },
                                    {
                                        type: "literal",
                                        of: 0
                                    }
                                ]
                            }
                        },
                        {
                            name: "NetRevenue",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "*",
                                items: [
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Computations",
                                                name: "Revenue"
                                            },
                                            row: "self"
                                        }
                                    },
                                    {
                                        type: "compound",
                                        with: "-",
                                        items: [
                                            {
                                                type: "literal",
                                                of: 1
                                            },
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Computations",
                                                        name: "Discount"
                                                    },
                                                    row: "self"
                                                }
                                            }
                                        ]
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

const tablebook3: TableBook = {
    name: "ExpressionTest",
    theme: "@business",
    definitions: {
        colors: {
            primaryBack: "#f5f5f5",
            primaryFore: "#333333",
            highlightBack: "#e3f2fd",
        },
        formats: {
            numeric: {
                money: {
                    type: "currency",
                    integer: { fixed: 1 },
                    decimal: { fixed: 2 },
                    symbol: "$",
                    position: "prefix"
                },
                percent: {
                    type: "percent",
                    integer: { fixed: 1 },
                    decimal: { fixed: 1 }
                }
            }
        },
        styles: {
            business: {
                fore: "#ffffff",
                bold: true,
                beneath: {
                    type: "thin",
                    color: "#000000"
                }
            }
        },
        themes: {
            business: {
                inherits: ['@blue'],
                group: '@business',
                header: '@business',
                data: {
                    fore: "@primaryFore",
                    back: "@primaryBack"
                }
            }
        }
    },
    pages: [
        {
            name: "BaseData",
            rows: 12,
            groups: [
                {
                    name: "Rates",
                    columns: [
                        {
                            name: "BasePrice",
                            type: {
                                kind: "numeric",
                                format: "@money",
                                rule: {
                                    type: ">",
                                    value: 0
                                }
                            }
                        },
                        {
                            name: "TaxRate",
                            type: {
                                kind: "numeric",
                                format: "@percent",
                                rule: {
                                    type: "between",
                                    low: 0,
                                    high: 1
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Volume",
                    columns: [
                        {
                            name: "MinQuantity",
                            type: {
                                kind: "numeric",
                                rule: {
                                    type: ">=",
                                    value: 0
                                }
                            }
                        },
                        {
                            name: "DiscountRate",
                            type: {
                                kind: "numeric",
                                format: "@percent",
                                rule: {
                                    type: "between",
                                    low: 0,
                                    high: 1
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: "Transactions",
            rows: 20,
            groups: [
                {
                    name: "Orders",
                    columns: [
                        {
                            name: "Quantity",
                            type: {
                                kind: "numeric",
                                rule: {
                                    type: ">=",
                                    value: 0
                                }
                            }
                        },
                        {
                            name: "Price",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            // References fixed row in BaseData
                            expression: {
                                type: "selector",
                                from: {
                                    column: {
                                        page: "BaseData",
                                        group: "Rates",
                                        name: "BasePrice"
                                    },
                                    row: "$1"
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Calculations",
                    columns: [
                        {
                            name: "AppliedDiscount",
                            type: {
                                kind: "numeric",
                                format: "@percent"
                            },
                            expression: {
                                type: "function",
                                name: "if",
                                args: [
                                    // Test relative backward reference within same page
                                    {
                                        type: "compound",
                                        with: ">=",
                                        items: [
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Orders",
                                                        name: "Quantity"
                                                    },
                                                    row: "self"
                                                }
                                            },
                                            // Test cross-page reference with fixed position
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        page: "BaseData",
                                                        group: "Volume",
                                                        name: "MinQuantity"
                                                    },
                                                    row: "$1"
                                                }
                                            }
                                        ]
                                    },
                                    // If condition is true, get discount from BaseData
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                page: "BaseData",
                                                group: "Volume",
                                                name: "DiscountRate"
                                            },
                                            row: "$1"
                                        }
                                    },
                                    {
                                        type: "literal",
                                        of: 0
                                    }
                                ]
                            }
                        },
                        {
                            name: "Subtotal",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "*",
                                items: [
                                    // Test relative backward reference
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Orders",
                                                name: "Quantity"
                                            },
                                            row: "self"
                                        }
                                    },
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Orders",
                                                name: "Price"
                                            },
                                            row: "self"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "DiscountAmount",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "*",
                                items: [
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Calculations",
                                                name: "Subtotal"
                                            },
                                            row: "self"
                                        }
                                    },
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Calculations",
                                                name: "AppliedDiscount"
                                            },
                                            row: "self"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "Tax",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "*",
                                items: [
                                    {
                                        type: "compound",
                                        with: "-",
                                        items: [
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Calculations",
                                                        name: "Subtotal"
                                                    },
                                                    row: "self"
                                                }
                                            },
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Calculations",
                                                        name: "DiscountAmount"
                                                    },
                                                    row: "self"
                                                }
                                            }
                                        ]
                                    },
                                    // Cross-page reference to tax rate
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                page: "BaseData",
                                                group: "Rates",
                                                name: "TaxRate"
                                            },
                                            row: "$1"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: "RunningTotal",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "compound",
                                with: "+",
                                items: [
                                    // Test relative backward reference for running total
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Calculations",
                                                name: "RunningTotal"
                                            },
                                            row: "-1"
                                        }
                                    },
                                    {
                                        type: "compound",
                                        with: "-",
                                        items: [
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Calculations",
                                                        name: "Subtotal"
                                                    },
                                                    row: "self"
                                                }
                                            },
                                            {
                                                type: "selector",
                                                from: {
                                                    column: {
                                                        group: "Calculations",
                                                        name: "DiscountAmount"
                                                    },
                                                    row: "self"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            name: "AverageOrder",
                            type: {
                                kind: "numeric",
                                format: "@money"
                            },
                            expression: {
                                type: "function",
                                name: "average",
                                args: [
                                    // Test range selector
                                    {
                                        type: "selector",
                                        from: {
                                            column: {
                                                group: "Calculations",
                                                name: "Subtotal"
                                            },
                                            row: {
                                                from: "$1",
                                                to: "+0"
                                            }
                                        }
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

const tablebook4: TableBook = {
    name: "SampleCompanyData",
    theme: "@business",
    definitions: {
        colors: {
            headerBack: "#2C3E50",
            headerText: "#FFFFFF",
            groupBack: "#ECF0F1",
            primaryBack: "#f5f5f5",
            primaryFore: "#333333",
            highlightBack: "#e3f2fd",
        },
        styles: {
            header: {
                fore: "@headerText",
                back: "@headerBack",
                bold: true
            },
            group: {
                back: "@groupBack",
                bold: true
            },
            warning: {
                fore: "@red",
                bold: true
            },
            business: {
                fore: "#ffffff",
                bold: true,
                beneath: {
                    type: "thin",
                    color: "#000000"
                }
            }
        },
        themes: {
            business: {
                inherits: ['@blue'],
                group: '@business',
                header: '@business',
                data: {
                    fore: "@primaryFore",
                    back: "@primaryBack"
                }
            }
        },
        formats: {
            numeric: {
                money: {
                    type: "currency",
                    integer: { fixed: 1 },
                    decimal: { fixed: 2 },
                    commas: true,
                    symbol: "$",
                    position: "prefix"
                },
                percent: {
                    type: "percent",
                    integer: { fixed: 1 },
                    decimal: { fixed: 1 },
                    commas: false
                }
            },
            temporal: {
                fullDate: [
                    { type: "monthname", length: "short" },
                    " ",
                    { type: "day", length: "short" },
                    ", ",
                    { type: "year", length: "long" }
                ]
            }
        },
        types: {
            status: {
                kind: "enum",
                values: [
                    { value: "Active", style: { fore: "@green" } },
                    { value: "Pending", style: { fore: "@orange" } },
                    { value: "Inactive", style: { fore: "@red" } }
                ]
            }
        }
    },
    pages: [{
        name: "EmployeeData",
        rows: 10,
        groups: [
            {
                name: "Personal",
                columns: [
                    {
                        name: "ID",
                        type: {
                            kind: "text",
                        }
                    }, {
                        name: "Name",
                        type: {
                            kind: "text",
                        }
                    }, {
                        name: "Status",
                        type: "@status"
                    }, {
                        name: "Department",
                        type: {
                            kind: "enum",
                            values: ["Sales", "Engineering", "Marketing", "HR", "Finance"]
                        }
                    }]
            },
            {
                name: "Employment",
                columns: [{
                    name: "StartDate",
                    type: {
                        kind: "temporal",
                        format: "@fullDate",
                        rule: {
                            type: ">",
                            value: "2020-01-01"
                        }
                    }
                }, {
                    name: "Salary",
                    type: {
                        kind: "numeric",
                        format: "@money",
                        rule: {
                            type: "between",
                            low: 30000,
                            high: 150000
                        },
                        styles: [{
                            rule: {
                                type: ">",
                                value: 100000
                            },
                            apply: "@warning"
                        }]
                    }
                }, {
                    name: "Bonus",
                    type: {
                        kind: "numeric",
                        format: "@percent",
                        rule: {
                            type: "between",
                            low: 0,
                            high: 0.30
                        }
                    }
                }, {
                    name: "Manager",
                    type: {
                        kind: "lookup",
                        values: {
                            group: "Personal",
                            name: "Name"  // References the Name column
                        }
                    }
                }]
            }]
    }]
};

const tablebook: TableBook = {
    name: "SimpleSheet",
    pages: [{
        name: "MainPage",
        rows: 10,
        groups: [{
            name: "MainGroup",
            columns: [
                {
                    name: "UserID",
                    type: {
                        kind: "text"
                    }
                },
                {
                    name: "Status",
                    type: {
                        kind: "enum",
                        values: [
                            "Active",
                            "Pending",
                            "Closed"
                        ]
                    }
                },
                {
                    name: "AssignedTo",
                    type: {
                        kind: "lookup",
                        values: {
                            name: "UserID"
                        }
                    }
                },
                {
                    name: "Description",
                    type: {
                        kind: "text",
                        rule: {
                            type: "contains",
                            value: "urgent"
                        },
                        styles: [{
                            rule: {
                                type: "contains",
                                value: "urgent"
                            },
                            apply: {
                                fore: "#FF0000",
                                bold: true
                            }
                        }]
                    }
                },
                {
                    name: "Email",
                    type: {
                        kind: "text",
                        rule: {
                            type: "ends",
                            value: "@company.com"
                        },
                        styles: [{
                            rule: {
                                type: "ends",
                                value: "@company.com"
                            },
                            apply: {
                                fore: "#0000FF"
                            }
                        }]
                    }
                },
                {
                    name: "ProjectCode",
                    type: {
                        kind: "text",
                        rule: {
                            type: "begins",
                            value: "PRJ-"
                        },
                        styles: [{
                            rule: {
                                type: "begins",
                                value: "PRJ-"
                            },
                            apply: {
                                fore: "#008000",
                                bold: true
                            }
                        }]
                    }
                },
                {
                    name: "Score",
                    type: {
                        kind: "numeric",
                        format: {
                            type: "number",
                            integer: { fixed: 2 },
                            decimal: { fixed: 1 },
                            commas: true
                        },
                        rule: { type: "between", low: 0, high: 100 },
                        styles: [{
                            rule: { type: ">", value: 90 },
                            apply: { fore: "#008000", bold: true }
                        }]
                    }
                },
                {
                    name: "Cost",
                    type: {
                        kind: "numeric",
                        format: {
                            type: "currency",
                            integer: { flex: 1 },
                            decimal: { fixed: 2 },
                            commas: true,
                            symbol: "$",
                            position: "prefix"
                        },
                        rule: { type: ">=", value: 0 },
                        styles: [{
                            rule: { type: ">", value: 1000 },
                            apply: { fore: "#FF0000" }
                        }]
                    }
                },
                {
                    name: "Progress",
                    type: {
                        kind: "numeric",
                        format: {
                            type: "percent",
                            integer: { fixed: 3 },
                            decimal: { fixed: 1 }
                        },
                        rule: { type: "between", low: 0, high: 1 },
                        styles: [
                            {
                                rule: { type: "<", value: 0.5 },
                                apply: { fore: "#FF0000" }
                            },
                            {
                                rule: { type: ">=", value: 0.9 },
                                apply: { fore: "#008000", bold: true }
                            }
                        ]
                    }
                },
                {
                    name: "Quantity",
                    type: {
                        kind: "numeric",
                        format: {
                            type: "number",
                            integer: { align: 4 },
                            decimal: { fixed: 0 },
                            commas: true
                        },
                        rule: { type: ">=", value: 0 }
                    }
                }

            ]
        }]
    }]
};

testTablebook(tablebook);