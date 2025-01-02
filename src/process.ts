import { SheetGenerator } from "./sheets/SheetGenerator";
import { TableBook } from "./tables/types";


type ResolvedColumn = {
    sheet: string;
    group: boolean;
    index: number;
};

export const process = (tablebook: TableBook, generator: SheetGenerator) => {
    const resolved: Map<string, ResolvedColumn> = new Map();

    // Get Full Column Names
    for (let s = 0; s < tablebook.sheets.length; s++) {
        const sheet = tablebook.sheets[s];

        for (let g = 0; g < sheet.groups.length; g++) {
            const group = sheet.groups[g];

            for (let c = 0; c < group.columns.length; c++) {
                const column = group.columns[c];

                const fullname = sheet.groups.length > 1 ? `${sheet.name}.${group.name}.${column.name}` : `${sheet.name}.${column.name}`;

                if (resolved.has(fullname))
                    throw new Error(`Duplicate column name: ${fullname}`);

                resolved.set(fullname, { sheet: sheet.name, group: sheet.groups.length > 1, index: c });
            }
        }
    }
};

const tb = {
    "name": "SalesAnalysis2024",
    "theme": "@blue",
    "description": "Quarterly Sales Analysis Report for 2024",
    "definitions": {
        "colors": {
            "profitGreen": "#90EE90",
            "lossRed": "#FFB6C6",
            "neutralGray": "#F5F5F5",
            "highlightYellow": "#FFFACD"
        },
        "styles": {
            "profit": {
                "fore": "@profitGreen",
                "form": {
                    "bold": true
                }
            },
            "loss": {
                "fore": "@lossRed",
                "form": {
                    "bold": true,
                    "italic": true
                }
            },
            "highlight": {
                "back": "@highlightYellow"
            },
            "total": {
                "form": {
                    "bold": true
                },
                "back": "@neutralGray"
            }
        },
        "themes": {
            "financialHeader": {
                "inherits": ["@blue"],
                "header": {
                    "form": {
                        "bold": true
                    },
                    "below": {
                        "type": "thick",
                        "color": "@blue"
                    }
                },
                "data": {
                    "back": "@neutralGray"
                }
            }
        },
        "formats": {
            "numeric": {
                "money": {
                    "type": "currency",
                    "integer": {
                        "fixed": 1,
                        "flex": 3
                    },
                    "decimal": 2,
                    "symbol": "$",
                    "position": "prefix",
                    "commas": true
                },
                "percent": {
                    "type": "percent",
                    "integer": 2,
                    "decimal": 1,
                    "commas": false
                }
            },
            "temporal": {
                "quarterFormat": [
                    {
                        "type": "year",
                        "length": "short"
                    },
                    " Q",
                    {
                        "type": "month",
                        "length": "short"
                    }
                ]
            }
        },
        "types": {
            "moneyAmount": {
                "name": "numeric",
                "format": "@money",
                "styles": [
                    {
                        "on": {
                            "type": ">",
                            "to": 0
                        },
                        "style": "@profit"
                    },
                    {
                        "on": {
                            "type": "<",
                            "to": 0
                        },
                        "style": "@loss"
                    }
                ]
            },
            "growthRate": {
                "name": "numeric",
                "format": "@percent",
                "styles": [
                    {
                        "on": {
                            "type": ">",
                            "to": 0.1
                        },
                        "style": "@profit"
                    },
                    {
                        "on": {
                            "type": "<",
                            "to": -0.1
                        },
                        "style": "@loss"
                    }
                ]
            }
        }
    },
    "sheets": [
        {
            "name": "QuarterlySummary",
            "theme": "@financialHeader",
            "description": "Quarterly performance overview",
            "rows": 100,
            "groups": [
                {
                    "name": "Performance",
                    "columns": [
                        {
                            "name": "Quarter",
                            "type": {
                                "name": "temporal",
                                "format": "@quarterFormat"
                            }
                        },
                        {
                            "name": "Revenue",
                            "type": "@moneyAmount",
                            "description": "Total quarterly revenue"
                        },
                        {
                            "name": "Costs",
                            "type": "@moneyAmount",
                            "description": "Total quarterly costs"
                        },
                        {
                            "name": "Profit",
                            "type": "@moneyAmount",
                            "expression": {
                                "type": "compound",
                                "with": "-",
                                "items": [
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "Revenue"
                                        }
                                    },
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "Costs"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "name": "GrowthRate",
                            "type": "@growthRate",
                            "expression": {
                                "type": "function",
                                "name": "percentChange",
                                "args": [
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "Revenue",
                                            "row": "self"
                                        }
                                    },
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "Revenue",
                                            "row": "-1"
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "name": "RegionalBreakdown",
                    "columns": [
                        {
                            "name": "Region",
                            "type": {
                                "name": "enum",
                                "values": [
                                    {
                                        "value": "North",
                                        "style": {
                                            "fore": "@blue"
                                        }
                                    },
                                    {
                                        "value": "South",
                                        "style": {
                                            "fore": "@orange"
                                        }
                                    },
                                    {
                                        "value": "East",
                                        "style": {
                                            "fore": "@green"
                                        }
                                    },
                                    {
                                        "value": "West",
                                        "style": {
                                            "fore": "@purple"
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "name": "RegionalRevenue",
                            "type": "@moneyAmount"
                        },
                        {
                            "name": "RegionalShare",
                            "type": "@growthRate",
                            "expression": {
                                "type": "function",
                                "name": "divide",
                                "args": [
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "RegionalRevenue"
                                        }
                                    },
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "Revenue",
                                            "row": "self"
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
            "name": "ProductDetails",
            "rows": 500,
            "groups": [
                {
                    "name": "Products",
                    "columns": [
                        {
                            "name": "ProductId",
                            "type": {
                                "name": "text",
                                "rule": {
                                    "type": "begins",
                                    "value": "PRD"
                                }
                            }
                        },
                        {
                            "name": "Category",
                            "type": {
                                "name": "enum",
                                "values": [
                                    "Electronics",
                                    "Furniture",
                                    "Office",
                                    "Services"
                                ]
                            }
                        },
                        {
                            "name": "UnitsSold",
                            "type": {
                                "name": "numeric",
                                "format": {
                                    "type": "number",
                                    "integer": 4,
                                    "commas": true
                                }
                            }
                        },
                        {
                            "name": "UnitPrice",
                            "type": "@moneyAmount"
                        },
                        {
                            "name": "TotalRevenue",
                            "type": "@moneyAmount",
                            "expression": {
                                "type": "compound",
                                "with": "*",
                                "items": [
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "UnitsSold"
                                        }
                                    },
                                    {
                                        "type": "selector",
                                        "from": {
                                            "column": "UnitPrice"
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