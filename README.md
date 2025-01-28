## **Project Overview**

### **What is TableBook?**

`TableBook` is a TypeScript library for generating spreadsheets programmatically from a declarative schema. It focuses on structured, column-based tables with one table per page, using a typing system to ensure consistent data. Instead of referencing individual cells, `TableBook` operates on individual columns with optional row selections, avoiding the complexities of traditional spreadsheets. This design ensures simplicity, consistency, and maintainability.

### **Key Features**

- **Declarative Schema**: Define `TableBook` objects in JSON or YAML for one-time or reusable spreadsheet generation.
- **Robust Parsing and Validation**:
  - JSON and YAML support with error reporting.
  - Type-safe validation ensures compliance with strict schemas.
- **Flexible Styling and Theming**:
  - Inherit or override themes with cascading styles for headers, groups, and columns.
  - Built-in palette support for consistent color schemes.
- **Advanced Data Selection**:
  - Column- and row-based selectors for precise targeting.
  - Support for complex expressions and rules.
- **Comprehensive API**:
  - Core utilities for parsing, validating, processing, and generating `TableBook` objects.

### **Example Use Cases**

1. **Automating Spreadsheet Creation**:
   - Define a schema once and programmatically generate structured spreadsheets for business or data processing workflows.
2. **Enforcing Schema Validation**:
   - Ensure that table data adheres to predefined rules, formats, and styles for consistency and reliability.
3. **LLM and UI Integration**:
   - Generate JSON or YAML schemas programmatically using natural language interfaces or user-friendly UIs.


---

## **Using the Library**

### **Installation**

To start using `TableBook`, install it via npm:

```bash
npm install tablebook
```

### **Basic Workflow**

`TableBook` provides a straightforward pipeline for working with table schemas:

1. **Parse**: Convert JSON or YAML into a `TableBook` object.
2. **Validate**: Ensure the parsed object adheres to the schema.
3. **Process**: Transform the `TableBook` into a `SheetBook` structure for output.
4. **Generate**: Use custom generators to produce spreadsheets.

---

### **Code Example: Simple End-to-End Workflow**

Here’s a complete example demonstrating how to parse, validate, process, and generate a `TableBook`.

```typescript
import { tablebook } from 'tablebook';

async function main() {
  // Sample TableBook JSON (normally loaded from a file or API)
  const tableBookJson = `
  {
    "name": "Sales Report",
    "pages": [
      {
        "name": "Summary",
        "groups": [
          {
            "name": "Revenue",
            "columns": [
              {
                "name": "Region",
                "type": { "kind": "text" }
              },
              {
                "name": "Sales",
                "type": { "kind": "numeric", "format": { "type": "currency", "symbol": "$" } }
              }
            ]
          }
        ],
        "rows": 100
      }
    ]
  }
  `;

  // 1. Parse JSON into a TableBook object
  const parseResult = tablebook.parse('json', tableBookJson);

  if (!parseResult.success) {
    console.error('Parsing errors:', parseResult.info);
    return;
  }

  const parsedTableBook = parseResult.value;

  // 2. Validate the TableBook object
  const validateResult = tablebook.validate(parsedTableBook);

  if (!validateResult.success) {
    console.error('Validation errors:', validateResult.info);
    return;
  }

  const validTableBook = validateResult.value;

  // 3. Process the TableBook into a SheetBook
  const processResult = tablebook.process(validTableBook);

  if (!processResult.success) {
    console.error('Processing errors:', processResult.info);
    return;
  }

  const sheetBook = processResult.value;

  // 4. Generate a Google Sheet using a custom generator
  const generator = await tablebook.generators.google('user@example.com', 'API_KEY', 'SHEET_ID', true);

  const genResult = await generator.generate(sheetBook);

  if (!genResult.success) 
    console.error('Generation errors:', genResult.info);
  else 
    console.log('Spreadsheet generated successfully!');
}

```
---
---
---

## **API Guide and Reference**

### Table of Contents

1. [1. Result](#1-result)
2. [2. TableBookIssue](#2-tablebookissue)
   - [2.1 TableBookParseIssue](#21-tablebookparseissue)
   - [2.2 TableBookValidateIssue](#22-tablebookvalidateissue)
   - [2.3 TableBookProcessIssue](#23-tablebookprocessissue)
   - [2.4 TableBookGenerateIssue](#24-tablebookgenerateissue)
3. [3. TableSelector](#3-tableselector)
   - [3.1 Single Group vs. Multiple Groups](#31-single-group-vs-multiple-groups)
   - [3.2 Translating Selectors to A1 Notation](#32-translating-selectors-to-a1-notation)
4. [4. TableReference](#4-tablereference)
5. [5. TableStyle](#5-tablestyle)
6. [6. TableHeaderStyle](#6-tableheaderstyle)
7. [7. TableTheme](#7-tabletheme)
8. [8. Expressions](#8-expressions)
   - [8.1 TableLiteralExpression](#81-tableliteralexpression)
   - [8.2 TableSelectorExpression](#82-tableselectorexpression)
   - [8.3 TableCompoundExpression](#83-tablecompoundexpression)
   - [8.4 TableNegatedExpression](#84-tablenegatedexpression)
   - [8.5 TableFunctionExpression](#85-tablefunctionexpression)
   - [8.6 TableRawExpression](#86-tablerawexpression)
9. [9. TableColumnType](#9-tablecolumntype)
   - [9.1 Text Type](#91-text-type)
   - [9.2 Enum Type](#92-enum-type)
   - [9.3 Lookup Type](#93-lookup-type)
   - [9.4 Numeric Type](#94-numeric-type)
   - [9.5 Temporal Type](#95-temporal-type)
10. [10. TableUnit and Hierarchical Structure](#10-tableunit-and-hierarchical-structure)
    - [10.1 TableUnit](#101-tableunit)
    - [10.2 TableColumn](#102-tablecolumn)
    - [10.3 TableGroup](#103-tablegroup)
    - [10.4 TablePage](#104-tablepage)
    - [10.5 TableBook](#105-tablebook)
      - [10.5.1 TableDefinitions](#1051-tabledefinitions)

---
---

### **1. Result**

The `Result` type represents the outcome of an operation, which can either succeed or fail. It is a generic utility type, parameterized by:
- `T`: The type of the value when the operation is successful.
- `I`: The type of the additional information when the operation fails.

#### **Definition**
```typescript
export type Result<T, I> =
    | { success: true; value: T }
    | { success: false; info: I; value?: T };
```

#### **Usage**
The `Result` type ensures that all operations explicitly define success or failure, making it easier to handle errors consistently.

#### **Properties**
| Field         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| `success`     | `true` or `false` | Indicates if the operation succeeded.     |
| `value`       | `T` (optional for failures) | The value returned on success or failure. |
| `info`        | `I` (only for failures) | Additional details about the failure.    |

#### **Methods**
`Result` includes utility functions for creating and handling result objects:

- **`Result.success(value: T): Result<T, any>`**
  Creates a success result.
  ```typescript
  const successResult = Result.success("Processed successfully");
  ```

- **`Result.failure(info: I, value?: T): Result<T, I>`**
  Creates a failure result, optionally including a value.
  ```typescript
  const failureResult = Result.failure("Invalid input format", rawInput);
  ```

---
---

### **2. TableBookIssue**

The `TableBookIssue` type represents errors or warnings encountered while working with `TableBook` objects. It is a union type covering issues from four distinct phases:
- Parsing
- Validation
- Processing
- Generation

#### **Definition**
```typescript
export type TableBookIssue = 
    | TableBookParseIssue
    | TableBookValidateIssue
    | TableBookProcessIssue
    | TableBookGenerateIssue;
```

Each issue type contains unique fields based on its context.

---

### **2.1 TableBookParseIssue**
Represents issues encountered during the **parsing phase** (e.g., invalid JSON/YAML syntax).

#### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'parsing'`          | Indicates the parsing phase.              |
| `message`     | `string`             | Descriptive message about the issue.      |
| `location`    | `TextLocation`       | Location (line/column) of the issue.      |
| `length`      | `number`             | Length of the problematic text segment.   |

#### **Example**
```typescript
const issue: TableBookParseIssue = {
  type: "parsing",
  message: "Unexpected token",
  location: { index: 15, line: 2, column: 6 },
  length: 1
};
```

---

### **2.2 TableBookValidateIssue**
Represents issues encountered during the **validation phase** (e.g., schema violations).

#### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'validating'`       | Indicates the validation phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `path`        | `ObjectPath`         | Path to the problematic data.             |
| `value`       | `any` (optional)     | The invalid value that caused the issue.  |

#### **Example**
```typescript
const issue: TableBookValidateIssue = {
  type: "validating",
  message: "Invalid type: expected numeric",
  path: ["page1", "Revenue", "Price"],
  value: "NotANumber"
};
```

---

### **2.3 TableBookProcessIssue**
Represents issues encountered during the **processing phase** (e.g., resolving references).

#### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'processing'`       | Indicates the processing phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `path`        | `ObjectPath`         | Path to the problematic data.             |
| `data`        | `any`                | Contextual data about the issue.          |

#### **Example**
```typescript
const issue: TableBookProcessIssue = {
  type: "processing",
  message: "Reference not found: @Revenue",
  path: ["page1", "Revenue"],
  data: { reference: "@Revenue" }
};
```

---

### **2.4 TableBookGenerateIssue**
Represents issues encountered during the **generation phase** (e.g., external generator errors).

#### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'generating'`       | Indicates the generation phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `data`        | `any`                | Contextual data about the issue.          |

#### **Example**
```typescript
const issue: TableBookGenerateIssue = {
  type: "generating",
  message: "Failed to connect to Google Sheets API",
  data: { errorCode: 401, reason: "Unauthorized" }
};
```

---

### **Handling TableBook Issues**

When working with `TableBook`, operations like parsing, validating, processing, or generating return `Result` types. Use the `info` field to inspect `TableBookIssue` objects when an operation fails.

#### **Example**
```typescript
const parseResult = tablebook.parse('json', rawInput);

if (!parseResult.success) {
  console.error("Parsing Issues:");
  for (const issue of parseResult.info) {
    console.error(`- ${issue.message} at line ${issue.location.line}`);
  }
}
```

---
---

## **3. TableSelector**

`TableSelector` provides a structured way to reference specific columns and rows in a `TableBook`. It ensures clarity and flexibility by using logical references instead of direct cell addresses (e.g., `A1:B5`). These logical references are later translated into A1-style spreadsheet references during generation.

---

### **Key Concepts**
1. **Column-Based Selection Only**: Unlike traditional spreadsheets, `TableBook` does not support cell-based or horizontal (multi-column) selection. All data selection is **column-centric**, targeting one column at a time.
2. **Page → Group → Column Paradigm**: Columns are identified within a hierarchy:
   - **Page**: Synonymous with a `Table`, representing a single table within the spreadsheet. Each `Page` in the `TableBook` corresponds to one logical table, forming the core unit of the "book of tables."
   - **Group**: A subgroup within a page that organizes related columns.
   - **Column**: The specific column within a group.

### **3.1 TableSelector Types**

A `TableSelector` can reference either the current column and row (`"self"`) or a specific combination of a column and rows.

#### **Type Definitions**
```typescript
export type TableSelector = 
  | TableSelfSelector
  | {
      column: TableColumnSelector | TableSelfSelector;
      rows: TableRowSelector | TableSelfSelector;
  };
```

#### **3.1.1 TableSelfSelector**
```typescript
export type TableSelfSelector = "self";
```
- Refers to the **current column** and/or **row** in context.  

#### **3.1.2 TableColumnSelector**
```typescript
export type TableColumnSelector = {
  page?: string;  // Optional page.
  group?: string; // Optional group, required if page is included.
  name: string;   // Required column name.
};
```
- Identifies a column by its **page**, **group**, and **name**.  
- If `page` is included, `group` must also be specified.

##### **Examples**
| Selector                                              | Meaning                                                             |
|-------------------------------------------------------|---------------------------------------------------------------------|
| `{ name: "Sales" }`                                   | References `"Sales"` in the current page and group.                 |
| `{ group: "Revenue", name: "Sales" }`                 | References `"Sales"` in `"Revenue"` in the current page.            |
| `{ page: "Summary", group: "Revenue", name: "Sales" }`| Fully qualified reference to `"Sales"` in `"Revenue"` on `"Summary"`.|

#### **3.1.3 TableRowSelector**
```typescript
export type TableRowSelector = 
  | TableUnitSelector
  | TableRangeSelector
  | TableAllSelector
  | TableSelfSelector;
```

##### **TableUnitSelector**
```typescript
export type TableUnitSelector = `$${number}` | `+${number}` | `-${number}`;
```
- **`$n`**: Absolute, zero-based row within the data region.  
- **`+n`**: Row offset forward from the current row.  
- **`-n`**: Row offset backward from the current row.

##### **TableRangeSelector**
```typescript
export type TableRangeSelector = {
  from: TableUnitSelector;
  to: TableUnitSelector;
};
```
- Selects a range of rows between two positions (inclusive).

##### **TableAllSelector**
```typescript
export type TableAllSelector = "all";
```
- Selects all rows in the specified column.

---

### **3.2 Single Group vs. Multiple Groups**

The structure of a table depends on whether it has **one group** or **multiple groups** of columns.

#### **Single Group Example**
| **Row** | **A**        | **B**      | **C**        |
|---------|--------------|------------|--------------|
| **1**   | **Sales**    | **Cost**   | **Profit**   |
| **2**   | Data Row 1   | Data Row 1 | Data Row 1   |
| **3**   | Data Row 2   | Data Row 2 | Data Row 2   |

- **Row 1**: Column headers.  
- **Row 2 onward**: Data rows.

**Key Rule**: The first data row corresponds to **logical `$0`**, which maps to A1 row **2**.

---

#### **Multiple Groups Example**
| **Row** |       **A**       |      **B**       |       **C**       |       **D**       |      **E**       |
|---------|--------------------|------------------|--------------------|--------------------|------------------|
| **1**   | **Revenue Group** | **Revenue Group**| **Revenue Group** | **Expense Group** | **Expense Group** |
| **2**   | **Sales**         | **Cost**         | **Profit**         | **Labor**         | **Materials**     |
| **3**   | Data Row 1         | Data Row 1       | Data Row 1         | Data Row 1         | Data Row 1        |
| **4**   | Data Row 2         | Data Row 2       | Data Row 2         | Data Row 2         | Data Row 2        |

- **Row 1**: Group headers (span multiple columns).  
- **Row 2**: Column headers.  
- **Row 3 onward**: Data rows.

**Key Rule**: The first data row corresponds to **logical `$0`**, which maps to A1 row **3**.

---

### **3.3 Translating Selectors to A1 Notation**

#### **Translation Rules**
1. **Columns**:
   - Columns are mapped to spreadsheet letters (e.g., `"Sales"` → `A`).
2. **Rows**:
   - `$n` corresponds to the **nth data row** in TableBook logic:
     - Row 2 in A1 for single groups.
     - Row 3 in A1 for multiple groups.

#### **Examples**

##### **1. Column Selector with All Rows**
```typescript
{ column: { name: "Sales" }, rows: "all" }
```
- Logical: All rows in `"Sales"`.
- A1 Translation (If Sales is Column 0):
  - Single group: `$A2:$A`.
  - Multiple groups: `$A3:$A`.

---

##### **2. Fully Qualified Selector with Absolute Row**
```typescript
{
  column: { page: "Summary", group: "Revenue", name: "Sales" },
  rows: "$0"
}
```
- Logical: First data row in `"Sales"` on `"Summary"`.
- A1 Translation: `Summary!$A$2` (single group) or `Summary!$A$3` (multiple groups).

---

##### **3. Relative Row Offset**
```typescript
{
  column: { name: "Profit" },
  rows: "+1"
}
```
- Logical: Row one step below the current row in `"Profit"`.
- A1 Translation (if current row is `$2`): `$C4`.

---

##### **4. Range of Rows**
```typescript
{
  column: { name: "Sales" },
  rows: { from: "$0", to: "$4" }
}
```
- Logical: Rows `$0` to `$4` in `"Sales"`.
- A1 Translation:
  - Single group: `$A$2:$A$6`.
  - Multiple groups: `$A$3:$A$7`.

---

##### **5. Self-Selector**
```typescript
"self"
```
- Logical: Current column and row.
- A1 Translation: Context-dependent (e.g., `$A2` if in column `"Sales"` and row `$0`).

---

### **3.4 Key Takeaways**

1. **Column Selection**:
   - `{ name: "Sales" }` → Same group and page.
   - `{ group: "Revenue", name: "Sales" }` → Same page, specific group.
   - `{ page: "Summary", group: "Revenue", name: "Sales" }` → Fully qualified.

2. **Row Selection**:
   - `$n` → Absolute zero-based row.
   - `+n`/`-n` → Relative offsets.
   - `"all"` → All rows in the column.
   - `"self"` → Current column and row.

3. **Table Structure**:
   - Single Group: Data starts at A1 row 2 (`$0 → A2`).
   - Multiple Groups: Data starts at A1 row 3 (`$0 → A3`).

4. **Flexibility**:
   - Logical references decouple the schema from spreadsheet-specific addresses.

---
---

### **4. TableReference**

The `TableReference` type enables reusable definitions in `TableBook`. It allows you to reference shared elements like colors, styles, or themes, ensuring consistency across your table schema.

#### **Definition**
```typescript
export type TableReference = `@${string}`;
```

#### **Concept**
- A `TableReference` starts with `@`, followed by the key of the referenced item.
- These references point to predefined entries in the `definitions` object of the `TableBook`.

---
---

### **5. TableStyle**

The `TableStyle` type defines visual styling for text and backgrounds. It is a reusable element that can be applied wherever specific styling is required in a `TableBook`.

#### **TableColor**
A `TableColor` is a 6-digit hexadecimal color code that defines fixed colors.

```typescript
export type TableColor = `#${string}`;
```

#### **TableStyle**
The `TableStyle` type allows customization of text and background appearance.

```typescript
export type TableStyle = {
    fore?: TableColor | TableReference; // Text color.
    back?: TableColor | TableReference; // Background color.
    bold?: boolean;                     // Whether the text is bold.
    italic?: boolean;                   // Whether the text is italicized.
};
```

---

### **Key Concepts**
- **Colors**: Use `TableColor` for fixed hexadecimal color codes or `TableReference` to point to reusable color definitions.
- **Usage**: `TableStyle` is applied directly to specific schema elements where visual customization is needed. It does not cascade or inherit from parent elements.

---

### **Example**

#### **Text Example**
```typescript
const style: TableStyle = {
  fore: "#FFFFFF",
  back: "#0000FF",
  bold: true
};
```

---

### **Key Takeaways**
- Use `TableStyle` for direct text and background styling.
- Combine fixed colors (`TableColor`) with reusable references (`TableReference`) for flexibility.

---
---

### **6. TableHeaderStyle**

The `TableHeaderStyle` type extends `TableStyle` to include border and partition options. It is specifically used for styling table headers, such as group or column headers, to enhance visual structure.

---

### **6.1 Definition**

```typescript
export type TableHeaderStyle = TableStyle & {
    beneath?: TableBorder;  // Border beneath the header.
    between?: TableBorder;  // Border between groups or columns.
};
```

---

### **6.2 TableBorder**

The `TableBorder` type defines the appearance of a border.

#### **Definition**
```typescript
export type TableBorder = {
    type: TableBorderType;              // The line style of the border.
    color: TableColor | TableReference; // The color of the border.
};
```

#### **TableBorderType**
Represents the available styles for border lines:
```typescript
export const TableBorderTypes = [
    "none", 
    "thin", "medium", "thick",
    "dotted", "dashed", "double"
] as const;

export type TableBorderType = typeof TableBorderTypes[number];
```

---

### **6.3 TablePartition**

The `TablePartition` type groups together border definitions for beneath and between partitions, allowing granular control of the appearance of header styles.

#### **Definition**
```typescript
export type TablePartition = {
    beneath?: TableBorder; // Border beneath the header.
    between?: TableBorder; // Border between groups or columns.
};
```

---

### **6.4 Example**

#### **Text Example**
```typescript
const headerStyle: TableHeaderStyle = {
  fore: "#FFFFFF",
  back: "#333333",
  bold: true,
  beneath: { type: "thick", color: "#0000FF" },
  between: { type: "dashed", color: "#FF5733" }
};
```

#### **JSON Example**
```json
{
  "fore": "#FFFFFF",
  "back": "#333333",
  "bold": true,
  "beneath": {
    "type": "thick",
    "color": "#0000FF"
  },
  "between": {
    "type": "dashed",
    "color": "#FF5733"
  }
}
```

---

### **Key Takeaways**
- **TableHeaderStyle** extends `TableStyle` with border options for headers.
- Use **TableBorder** for styling individual lines and **TablePartition** for grouping border styles.

---
---

### **7. TableTheme**

A **TableTheme** defines coordinated styling for multiple areas—tabs, group headers, column headers, and data cells. You can apply a theme at different levels of a `TableBook`, with each level either using or refining the theme from above.

#### **7.1 Definition**

```typescript
export type TableTheme = {
  inherits?: TableReference[];  // Other themes to merge into this one
  tab?: TableColor | TableReference;
  group?: TableHeaderStyle | TableReference;
  header?: TableHeaderStyle | TableReference;
  data?: TableStyle | TableReference;
};
```

- **`inherits`**  
  An ordered array of theme references. Each referenced theme is merged into the current theme one by one, so later themes override matching properties of earlier themes (property-by-property).

- **`tab`**  
  The color or reference used for the spreadsheet’s tab.

- **`group`**  
  The style or reference used for group headers (uses `TableHeaderStyle`).

- **`header`**  
  The style or reference used for column headers (uses `TableHeaderStyle`).

- **`data`**  
  The style or reference used for data cells (uses `TableStyle`).

---

### **7.2 Flow from Book → Page → Group → Column**

Themes can be defined at any level of the `TableBook`. When a level has no theme, it simply keeps the one from above. If a level **does** define or reference a theme, that new theme merges its properties on top of whatever came before it. For example:

1. **Book Level**  
   Set a global theme that applies to all pages by default.
2. **Page Level**  
   Refine or replace the book theme if needed for that Page.
3. **Group Level**  
   Further customize the group’s style.
4. **Column Level**  
   Optionally refine the theme again, but only if specific columns require different looks.

---

### **7.3 Built-In Palettes**

`TableBook` includes a set of prebuilt palettes, each with four shades:

- **Darkest** → applies to `group.back`
- **Dark** → applies to `header.back`
- **Main** → applies to `tab`
- **Lightest** → applies to `data.back`

All these palettes use relatively dark shades for group headers and column headers. **You’ll likely want to define bold, white text** (or another contrasting color) for your group/header styles if you want the text to stand out.

Below is a categorized list of built-in palette names (each name is referenced with an `@` symbol in themes, e.g., `"theme": "@red"`):

```
Reds:
  - pink
  - cranberry
  - red

Oranges & Yellows:
  - rust
  - orange
  - yellow

Greens:
  - green
  - moss
  - sage

Blues:
  - teal
  - slate
  - cyan
  - blue
  - azure
  - skyblue

Purples:
  - lavender
  - indigo
  - purple
  - plum
  - mauve

Neutrals:
  - coral
  - terracotta
  - bronze
  - sand
  - taupe
  - gray
  - charcoal
```

When you reference one of these palettes in a theme (for example, `"theme": "@blue"`), the background colors for `group`, `header`, `tab`, and `data` will be set automatically. If you want readable text on dark headers/groups, define a lighter or white foreground color in `group` or `header` style.
Best is define it globally in the Book theme.


---

### **7.4 Example: Setting a Book Theme**

Below is an example of a **book-level** theme referencing the built-in **blue** palette. It then explicitly sets white, bold text for `group` and `header`:

```json
{
  "name": "MyReport",
  "theme": {
    "inherits": ["@blue"],
    "group": {
      "fore": "#FFFFFF",
      "bold": true
    },
    "header": {
      "fore": "#FFFFFF",
      "bold": true
    }
  },
  "pages": [
    {
      "name": "Summary",
      "groups": [
        {
          "name": "Revenue",
          "columns": [
            { "name": "Sales" },
            { "name": "Cost" }
          ]
        }
      ]
    }
  ]
}
```

- **`inherits: ["@blue"]`**  
  Applies the `blue` palette (darkest → `group.back`, dark → `header.back`, main → `tab`, lightest → `data.back`).
- **`group` and `header`**  
  Set their text color to `#FFFFFF` (white) and enable `bold`, ensuring high contrast on dark backgrounds.
- **Pages**, **Groups**, **Columns**  
  All inherit from this book-level theme unless they specify their own.

---

### **7.5 Default Book Theme**

A good starting theme for your TableBook allows you to use different palettes for each page while ensuring clarity and consistency. The following example sets a clean, bold look for group and header text, with clear dividing lines between groups and columns.

```json
{
   "name": "BookName",
   "theme": {
      "inherits": ["@gray"],
      "group": {
         "fore": "#FFFFFF",
         "bold": true,
         "between": { "type": "medium", "color": "#333333" }
      },
      "header": {
         "fore": "#FFFFFF",
         "bold": true,
         "between": { "type": "thin", "color": "#333333" }
      }
   }   
}
```

---

### **7.6 Key Points**

1. **Property-by-Property Merging**  
   Multiple themes in `inherits` apply one after the other. Each level (book, page, group, column) can refine or leave properties as-is.
2. **Prebuilt Palettes**  
   Provide convenient color sets. They automatically fill in `group.back`, `header.back`, `tab`, and `data.back` with coordinated shades.
3. **Dark Headers**  
   Because most prebuilt palettes have dark `group` and `header` backgrounds, you may want to specify bold, white text for clarity.
4. **Flexibility**  
   If a page or group doesn’t define a theme, it continues to use the parent’s. If it does define a theme, it overrides or merges where specified.

---
---

### **8. Expressions**

Expressions in `TableBook` are used to define structured formulas, replacing traditional spreadsheet cell references (e.g., `A1:B5`) with precise column-row relationships via `TableSelectors`. These formulas allow for consistent, column-based computations that translate into spreadsheet formulas during generation.

#### **8.1 Definition**

```typescript
export type TableExpression =
  | TableLiteralExpression
  | TableSelectorExpression
  | TableCompoundExpression
  | TableNegatedExpression
  | TableFunctionExpression
  | TableRawExpression;
```

---

### **8.2 TableLiteralExpression**

The simplest type of expression, a `TableLiteralExpression`, represents a fixed value (number, string, or boolean).

#### **Definition**
```typescript
export type TableLiteralExpression = {
    type: "literal";
    of: string | number | boolean;
};
```

#### **Example**
```typescript
const literalExpression: TableLiteralExpression = {
  type: "literal",
  of: 42
};
```

This translates to the literal value `42` in a formula.

---

### **8.3 TableSelectorExpression**

A `TableSelectorExpression` references data in a specific column and row. Instead of traditional spreadsheet ranges, it uses a `TableSelector` to target the data.

#### **Definition**
```typescript
export type TableSelectorExpression = {
    type: "selector";
    from: TableSelector;
};
```

#### **Example**
```typescript
const selectorExpression: TableSelectorExpression = {
  type: "selector",
  from: {
    column: { name: "Revenue" },
    rows: "$5"
  }
};
```

This references the `Revenue` column, specifically the 5th row - or 6 in A1 addressing.

---

### **8.4 TableCompoundExpression**

A `TableCompoundExpression` combines multiple expressions using an operator. It supports both comparison and arithmetic/merge operators.

#### **Definition**
```typescript
export type TableCompoundExpression = {
    type: "compound";
    with: TableComparisonOperator | TableMergeOperator;
    items: TableExpression[];
};
```

#### **Available Operators**

**Comparison Operators**: Used for logical comparisons.
| Operator | Description       |
|----------|-------------------|
| `=`      | Equal to          |
| `<>`     | Not equal to      |
| `>`      | Greater than      |
| `<`      | Less than         |
| `>=`     | Greater than or equal to |
| `<=`     | Less than or equal to    |

**Merge (Arithmetic) Operators**: Used for numerical or string operations.
| Operator | Description        |
|----------|--------------------|
| `+`      | Addition/Concatenation |
| `-`      | Subtraction        |
| `*`      | Multiplication     |
| `/`      | Division           |
| `^`      | Exponentiation     |
| `&`      | String concatenation |

#### **Example**
```typescript
const compoundExpression: TableCompoundExpression = {
  type: "compound",
  with: "+",
  items: [
    { type: "selector", from: { column: { name: "Revenue" }, rows: "$0" } },
    { type: "literal", of: 100 }
  ]
};
```

If `Revenue` was column `C` (with no group header), this translates to `=$C$2 + 100`.

---

### **8.5 TableNegatedExpression**

A `TableNegatedExpression` inverts the result of another expression.

#### **Definition**
```typescript
export type TableNegatedExpression = {
    type: "negated";
    on: TableExpression;
};
```

#### **Example**
```typescript
const negatedExpression: TableNegatedExpression = {
  type: "negated",
  on: {
    type: "selector",
    from: { column: { name: "Profit" }, rows: "self" }
  }
};
```

If `Profit` was column `B` (with no group header), this corresponds to `=-($B2)`

---

### **8.6 TableFunctionExpression**

A `TableFunctionExpression` applies a named function to a list of arguments, which can be other expressions.

#### **Definition**
```typescript
export type TableFunctionExpression = {
    type: "function";
    name: string;
    args: TableExpression[];
};
```

#### **Example**
```typescript
const functionExpression: TableFunctionExpression = {
  type: "function",
  name: "SUM",
  args: [
    { type: "selector", from: { column: { page: 'Items', group: 'Info', name: "Revenue" }, rows: "all" } },
    { type: "literal", of: 50 }
  ]
};
```

If `Revenue` was column `D` (with a group header), this translates to `SUM(Items!$D3:$D, 50)`.

---

### **8.7 TableRawExpression**

A `TableRawExpression` represents a custom formula defined as raw text with placeholders (`tags`) that map to specific data selectors. This allows you to write advanced formulas while maintaining the structured column-row relationships of `TableBook`.

---

#### **Definition**
```typescript
export type TableRawExpression = {
    type: "raw";
    text: string;                         // The formula text with placeholders.
    refs?: Record<string, TableSelector>; // Placeholders mapped to TableSelectors.
};
```

---

#### **How It Works**

1. **Placeholders (`text` field)**:  
   - The formula is written as a string, with placeholders (e.g., `@Revenue`) representing data points.
   - During spreadsheet generation, each placeholder is replaced with the corresponding cell or range address derived from its selector.

2. **Selectors (`refs` object)**:  
   - Each placeholder in the `text` field maps to a `TableSelector`.
   - The `TableSelector` specifies which column and rows to reference.  
   - For example:
     - `{ name: "Revenue", rows: "all" }` translates to `$C3:$C` if `Revenue` corresponds to column `C` with group headers present.

---

#### **Example**

##### **Raw Expression**
```typescript
const rawExpression: TableRawExpression = {
  type: "raw",
  text: "SUM(@Revenue) + @Constant",
  refs: {
    "@Revenue": {
      column: { name: "Revenue" },
      rows: "all"
    },
    "@Constant": {
      column: { name: "Constant" },
      rows: "$2"
    }
  }
};
```

##### **Explanation**
1. **Placeholders (`@Revenue`, `@Constant`)**:
   - `@Revenue` is mapped to all rows in the `Revenue` column.
   - `@Constant` is mapped to a specific absolute row (`$2`) in the `Constant` column.

2. **Result During Generation**:
   - The placeholders are replaced based on `TableSelector` translations:
     - `@Revenue` → `$C3:$C` (column `C`, rows starting at `3` due to a group header).
     - `@Constant` → `$D$4` (column `D`, absolute row `4`, no group header).

3. **Final Formula**:
   ```plaintext
   SUM($C3:$C) + $D$4
   ```

---

##### **Best Practices for Placeholders**
- Use descriptive and unique tags (e.g., `@Revenue` instead of generic names like `@Data`) to avoid conflicts or misinterpretation.
- Ensure that placeholders align with your formula's logic and structure.

---

### **8.8 Key Takeaways**

1. **Expressions Are Structured**: They use `TableSelectors` instead of traditional spreadsheet cells/ranges, ensuring clear column-based references.
2. **Formula Translation**: Each expression type maps directly to a spreadsheet formula during generation.
3. **Operators**: Support for logical comparisons and arithmetic/merge operations provides flexibility.
4. **Literal and Selector Expressions**: Use these for simple values or direct column-row references.
5. **Compound and Function Expressions**: Enable complex calculations by combining or processing data.

---
---

### **9. TableColumnType**

The `TableColumnType` defines the type of data in a column. It determines how data is validated, formatted, and optionally styled conditionally. There are five main types:

1. **Text** (`TableTextType`)
2. **Enum** (`TableEnumType`)
3. **Lookup** (`TableLookupType`)
4. **Numeric** (`TableNumericType`)
5. **Temporal** (`TableTemporalType`)

---

### **9.1 TableConditionalStyle**

The `TableConditionalStyle` type applies styling to data when a specific rule or condition is met. It is used in conjunction with rules for text, numeric, and temporal types.

#### **Definition**
```typescript
export type TableConditionalStyle<Rule> = {
    rule: Rule;                              // The rule to trigger this style.
    apply: TableStyle | TableReference;      // The style to apply if the rule is satisfied.
};
```

---

### **9.2 Rules Overview**

Rules (`TableRules`) define how values in a column are validated. Each type (text, numeric, temporal) has its own rule system, but all support custom rules using expressions.

---

#### **9.2.1 TableCustomRule**

A `TableCustomRule` defines advanced validation using expressions.

```typescript
export type TableCustomRule = {
    type: "custom";
    expression: TableExpression;
};
```
---

#### **9.2.2 Text Rules** (`TableTextRule`)

Text rules validate string values. 

```typescript
export type TableTextRule =
    | TableMatchRule
    | TableCustomRule;
```

##### **Match Rules**
```typescript
export type TableMatchRule = {
    type: "is" | "contains" | "begins" | "ends";
    value: string;
};
```

**Example:**
```typescript
const rule: TableTextRule = { type: "contains", value: "Important" };
```

---

#### **9.2.3 Numeric Rules** (`TableNumericRule`)

Numeric rules validate number values.

```typescript
export type TableNumericRule =
    | TableComparisonRule<number>
    | TableRangeRule<number>
    | TableCustomRule;
```

##### **Comparison Rules**
```typescript
export type TableComparisonRule<T> = {
    type: "=" | "<>" | ">" | "<" | ">=" | "<=";
    value: T;
};
```

##### **Range Rules**
```typescript
export type TableRangeRule<T> = {
    type: "between" | "outside";
    low: T;
    high: T;
};
```

**Examples:**
```typescript
const rule1: TableNumericRule = { type: ">", value: 10 };
const rule2: TableNumericRule = { type: "between", low: 5, high: 20 };
```

---

#### **9.2.4 Temporal Rules** (`TableTemporalRule`)

Temporal rules validate date and time values.

```typescript
export type TableTemporalRule =
    | TableComparisonRule<TableTemporalString>
    | TableRangeRule<TableTemporalString>
    | TableCustomRule;
```

##### **Temporal String**
Dates and times must follow ISO format (e.g., `YYYY-MM-DD`).

**Example:**
```typescript
const rule: TableTemporalRule = {
  type: "between",
  low: "2025-01-01",
  high: "2025-12-31"
};
```

---

### **9.3 Text Type** (`TableTextType`)

Represents string-based data.

```typescript
export type TableTextType = {
    kind: "text";
    rule?: TableTextRule;
    styles?: TableConditionalStyle<TableTextRule>[];
};
```

---

### **9.4 Enum Type** (`TableEnumType`)

Represents data with a fixed set of allowed values. Each value is defined as an `EnumItem` with optional styling or color to visually distinguish between them.

#### **Definition**

```typescript
export type TableEnumType = {
    kind: "enum";
    description?: string;          // A description of the enum's purpose or usage.
    items: TableEnumItem[];        // The list of allowed values (enum items).
};
```

##### **Enum Item**
An `EnumItem` defines an individual value in the enum and supports customizable styles or colors.

```typescript
export type TableEnumItem = {
    name: string;                             // The value of the enum item.
    description?: string;                     // Optional description for the item.
    style?: TableStyle | TableReference;      // A complete style for this item.
    color?: TableColor | TableReference;      // A shortcut for setting the foreground color.
};
```

---

#### **How `style` and `color` Work**

1. **Only `style` is Declared**:  
   The declared style is applied as-is.  
   ```json
   { "name": "Pending", "style": { "fore": "#FFA500", "bold": true } }
   ```

2. **Only `color` is Declared**:  
   The `color` is converted into a style with the `fore` property set to the `color` value.  
   ```json
   { "name": "Approved", "color": "#00FF00" }
   ```
   This becomes:
   ```json
   { "name": "Approved", "style": { "fore": "#00FF00" } }
   ```

3. **Both `style` and `color` Are Declared**:  
   The `color` overrides the `fore` property of the `style`.  
   ```json
   {
     "name": "Rejected",
     "style": { "fore": "#FFA500", "bold": true },
     "color": "#FF0000"
   }
   ```
   This becomes:
   ```json
   {
     "name": "Rejected",
     "style": { "fore": "#FF0000", "bold": true }
   }
   ```

---

#### **Example**

This example defines an enum with a description and three items, each with unique colors and optional descriptions:

```json
{
  "kind": "enum",
  "description": "Approval status for items in the report.",
  "items": [
    { "name": "Approved", "description": "Item was accepted.", "color": "#00FF00" },
    { "name": "Pending",  "description": "Item is under review.", "color": "#FFFF00" },
    { "name": "Rejected", "description": "Item was denied.", "style": { "bold": true }, "color": "#FF0000" }
  ]
}
```

---

### **9.5 Lookup Type** (`TableLookupType`)

References valid values from another column.

```typescript
export type TableLookupType = {
    kind: "lookup";
    column: TableColumnSelector;
};
```

---

### **9.6 Numeric Type** (`TableNumericType`)

The `TableNumericType` represents numerical data, allowing for precise control over validation, formatting, and conditional styling. It is one of the most customizable column types in `TableBook`.

---

#### **Definition**

```typescript
export type TableNumericType = {
    kind: "numeric";
    rule?: TableNumericRule;                            // Validation rules for numeric values.
    styles?: TableConditionalStyle<TableNumericRule>[]; // Conditional styling based on rules.
    format?: TableNumericFormat | TableReference;       // Formatting options for numeric values.
};
```

- **`rule`**: Validates numeric values with comparison, range, or custom rules.
- **`styles`**: Applies conditional styles when a numeric rule is satisfied.
- **`format`**: Controls how numbers are displayed.

---

#### **9.6.1 TableBaseNumericFormat**

All numeric formats (`number`, `percent`, `currency`) inherit from the `TableBaseNumericFormat`, which defines general options for displaying numbers.

##### **Definition**
```typescript
export type TableBaseNumericFormat<Type extends string> = {
    type: Type;                               // The format type (e.g., "number", "percent").
    integer?: number | TableDigitPlaceholder; // Formatting for digits before the decimal point, number is shorthand for { fixed: number; }
    decimal?: number | TableDigitPlaceholder; // Formatting for digits after the decimal point, number is shorthand for { fixed: number; }
    commas?: boolean;                         // Whether to separate thousands with commas.
};
```

---

#### **9.6.2 TableDigitPlaceholder**

`TableDigitPlaceholder` controls how digits are displayed using placeholder characters:

| Placeholder | Behavior                               |
|-------------|---------------------------------------|
| `'0'`       | Fixed digit: always shows a digit, even if it's `0`. |
| `'#'`       | Flexible digit: shows a digit if present, or nothing otherwise. |
| `'?'`       | Aligning digit: shows a digit if present, or a space for alignment. |

##### **Definition**
```typescript
export type TableDigitPlaceholder = {
    fixed?: number;  // Number of '0' placeholders.
    flex?: number;   // Number of '#' placeholders.
    align?: number;  // Number of '?' placeholders.
};
```

**Example:**
```typescript
const placeholder: TableDigitPlaceholder = { fixed: 2, flex: 3 };
```
- Displays two mandatory digits and up to three additional digits if available.

---

#### **9.6.3 Numeric Formats**

There are three specific numeric formats, each inheriting from `TableBaseNumericFormat`:

1. **Number Format**
    ```typescript
    export type TableNumberFormat = TableBaseNumericFormat<"number">;
    ```
    Displays numbers with three fixed digits before the decimal and up to two digits after the decimal, with thousands separators.

2. **Percent Format**
    ```typescript
    export type TablePercentFormat = TableBaseNumericFormat<"percent">;
    ```
    Displays percentages with one digit before and one digit after the decimal.

3. **Currency Format**
    ```typescript
    export type TableCurrencyFormat = TableBaseNumericFormat<"currency"> & {
        symbol?: string;                // The currency symbol (e.g., "$"), defaults to '$'
        position?: "prefix" | "suffix"; // Whether the symbol appears before or after the value, defaults to 'prefix'
    };
    ```

    Displays currency values like `$1234.56`, with defaulting to two fixed decimal places.

---

### **9.7 Temporal Type** (`TableTemporalType`)

The `TableTemporalType` represents date and time data, with flexible validation rules and customizable formatting. It simplifies handling ISO-compliant temporal values.

---

#### **Definition**

```typescript
export type TableTemporalType = {
    kind: "temporal";
    rule?: TableTemporalRule;                             // Validation rules for temporal values.
    styles?: TableConditionalStyle<TableTemporalRule>[];  // Conditional styling based on rules.
    format?: TableTemporalFormat | TableReference;        // Formatting for temporal values.
};
```

---

#### **9.7.1 Temporal Rules**

Temporal rules validate date and time values. They are similar to numeric rules but operate on temporal strings (`YYYY-MM-DD`).

**Example Rules:**
```typescript
const comparisonRule: TableTemporalRule = {
  type: "=",
  value: "2025-01-01"
};

const rangeRule: TableTemporalRule = {
  type: "between",
  low: "2025-01-01",
  high: "2025-12-31"
};
```

---

#### **9.7.2 TableTemporalUnit**

A `TableTemporalUnit` defines a single element of a temporal format, such as a year, month, day, or time component. Each unit can optionally specify a `length`, which determines whether the unit is displayed in a short or long format.

---

##### **Definition**
```typescript
export type TableTemporalUnit = {
    type: "year"       // The year of the date (e.g., 2025 or 25).
         | "month"     // Numeric month (e.g., 01 or 1).
         | "monthname" // Full or abbreviated month name (e.g., January or Jan).
         | "weekday"   // Full or abbreviated weekday name (e.g., Monday or Mon).
         | "day"       // Day of the month (e.g., 27 or 7).
         | "hour"      // Hour in 12-hour or 24-hour format (e.g., 03 or 3).
         | "minute"    // Minute of the hour (e.g., 45 or 5).
         | "second"    // Second of the minute (e.g., 30 or 3).
         | "meridiem"; // AM/PM designator (e.g., AM or a).
    length?: "short" | "long";  // Determines the format for the unit. See below.
};
```

---

##### **Unit Type Details**

| **Type**      | **Description**                          | **Short Example** | **Long Example**   |
|---------------|------------------------------------------|-------------------|--------------------|
| **`year`**    | The year of the date.                   | `25` (`yy`)       | `2025` (`yyyy`)    |
| **`month`**   | The numeric month of the year.          | `1` (`m`)         | `01` (`mm`)        |
| **`monthname`**| The name of the month.                 | `Jan` (`mmm`)     | `January` (`mmmm`) |
| **`weekday`** | The name of the day of the week.        | `Mon` (`ddd`)     | `Monday` (`dddd`)  |
| **`day`**     | The day of the month.                   | `7` (`d`)         | `07` (`dd`)        |
| **`hour`**    | The hour in 12-hour or 24-hour format.  | `3` (`h`)         | `03` (`hh`)        |
| **`minute`**  | The minute of the hour.                 | `5` (`m`)         | `05` (`mm`)        |
| **`second`**  | The second of the minute.               | `3` (`s`)         | `03` (`ss`)        |
| **`meridiem`**| The AM/PM designator.                   | `a` (`a/p`)       | `AM` (`AM/PM`)     |

---


##### **Example Temporal Formats**

Here are some complete examples of `TableTemporalFormat` using `TableTemporalUnit`:

1. **ISO Date Format**
   ```json
   [
     { "type": "year", "length": "long" },
     "-",
     { "type": "month", "length": "long" },
     "-",
     { "type": "day", "length": "long" }
   ]
   ```
   **Output:** `2025-01-27`

2. **Readable Date Format**
   ```json
   [
     { "type": "monthname", "length": "short" },
     " ",
     { "type": "day", "length": "long" },
     ", ",
     { "type": "year", "length": "long" }
   ]
   ```
   **Output:** `Jan 27, 2025`

3. **12-Hour Time with Meridiem**
   ```json
   [
     { "type": "hour", "length": "short" },
     ":",
     { "type": "minute", "length": "long" },
     " ",
     { "type": "meridiem", "length": "long" }
   ]
   ```
   **Output:** `3:05 PM`

---
---

Got it! Let’s take a **bottom-up approach**, fully integrating **TableDefinitions** into the `TableBook` section for a cleaner explanation. Here’s the revised structure:

---

### **10. TableUnit and Hierarchical Structure**

The `TableUnit` type provides the foundation for defining the `TableBook` hierarchy. This section builds from the smallest element (**TableColumn**) up to the entire workbook (**TableBook**), including reusable elements from `TableDefinitions`.

---

#### **10.1 TableUnit**

The `TableUnit` is a base type for all elements in the hierarchy, providing shared properties like `name`, `theme`, and `description`.

##### **Definition**
```typescript
export type TableUnit = {
    name: string;                                                // Unique identifier for the unit.
    theme?: TableTheme | TablePaletteReference | TableReference; // Optional visual theme.
    description?: string;                                        // Optional explanation of the unit's purpose.
};
```

---

#### **10.2 TableColumn**

A `TableColumn` represents the smallest unit of the hierarchy. It defines the data type, optional computed expressions, and metadata about its source.

##### **Definition**
```typescript
export type TableColumn = TableUnit & {
    type: TableColumnType | TableReference;      // The data type of the column.
    source?: string;                             // Optional metadata about the column's data source.
    expression?: TableExpression<TableSelector>; // Optional expression to compute the column's values.
};
```

##### **Key Properties**
- **`type`**: Specifies the column's data type, such as `numeric`, `text`, or `temporal`. See [TableColumnType](#9-tablecolumntype).
- **`source`**: Describes where the data originates (e.g., an external database or API).
- **`expression`**: Defines how the column's value is computed using structured expressions.

##### **Example**
```json
{
  "name": "Revenue",
  "type": { "kind": "numeric" },  
  "expression": {
    "type": "compound",
    "with": "+",
    "items": [
      { "type": "selector", "from": { "column": { "name": "Sales" }, "rows": "self" } },
      { "type": "selector", "from": { "column": { "name": "Discounts" }, "rows": "self" } }
    ]
  }
}
```

---

#### **10.3 TableGroup**

A `TableGroup` organizes related columns within a page. Groups make it easier to logically separate and style subsets of columns.

##### **Definition**
```typescript
export type TableGroup = TableUnit & {
    columns: TableColumn[]; // Array of columns within the group.    
};
```

##### **Key Details**
- Groups improve readability and organization.
- If a page contains only one group, the group name and header are hidden in the output.

##### **Example**
```json
{
  "name": "RevenueGroup",
  "columns": [
    { "name": "Revenue", "type": { "kind": "numeric" } },
    { "name": "Profit", "type": { "kind": "numeric" } }
  ]
}
```

---

#### **10.4 TablePage**
A `TablePage` represents a single sheet in the workbook, acting as the **table** in the `TableBook` paradigm. Each page contains one and only one table, which is defined by its groups and columns. The structure ensures that all data is organized vertically within this single table. This design keeps the focus on column-based relationships, with rows acting as records within the table. The `rows` property specifies the total number of records available for the table, ensuring consistency across all column groups.

##### **Definition**
```typescript
export type TablePage = TableUnit & {
    groups: TableGroup[]; // Array of column groups on the page.
    rows: number;         // Total number of data rows on the page.
};
```

##### **Key Details**
- **`rows`**: Determines the number of rows available for data. Columns and groups operate within this range.
- Pages can inherit or override themes from the book.

##### **Example**
```json
{
  "name": "SummaryPage",
  "rows": 100,
  "groups": [
    {
      "name": "RevenueGroup",
      "columns": [
        { "name": "Revenue", "type": { "kind": "numeric" } },
        { "name": "Cost", "type": { "kind": "numeric" } }
      ]
    }
  ]
}
```

---

#### **10.5 TableBook**

A `TableBook` is the root structure of the hierarchy, containing all pages and an optional `definitions` object for reusable elements.

##### **Definition**
```typescript
export type TableBook = TableUnit & {
    pages: TablePage[];        // Array of pages in the workbook.
    definitions?: TableDefinitions; // Centralized reusable definitions.
};
```

##### **TableDefinitions**
The `definitions` object allows you to define reusable colors, styles, themes, formats, and types.

##### **Definition**
```typescript
export type TableDefinitions = {
    colors?: Record<string, TableColor | TableReference>;                         // Custom color definitions.
    styles?: Record<string, TableHeaderStyle | TableReference>;                   // Reusable style definitions.
    themes?: Record<string, TableTheme | TablePaletteReference | TableReference>; // Theme definitions.
    formats?: {
        numeric?: Record<string, TableNumericFormat | TableReference>;            // Custom numeric formats.
        temporal?: Record<string, TableTemporalFormat | TableReference>;          // Custom temporal formats.
    };
    types?: Record<string, TableColumnType | TableReference>;                     // Reusable column type definitions.
};
```

##### **Example: TableDefinitions**
```json
{
  "definitions": {
    "colors": {
      "warning": "#FFA500",
      "danger": "#FF0000"
    },
    "styles": {
      "boldHeader": { "fore": "#FFFFFF", "back": "#0000FF", "bold": true }
    },
    "themes": {
      "reportTheme": { "inherits": ["@blue"], "header": { "bold": true } }
    },
    "formats": {
      "numeric": {
        "currency": { "type": "currency", "symbol": "$", "position": "prefix" }
      },
      "temporal": {
        "shortDate": [
          { "type": "monthname", "length": "short" },
          " ",
          { "type": "day" },
          ", ",
          { "type": "year" }
        ]
      }
    },
    "types": {
      "currencyColumn": { "kind": "numeric", "format": "@currency" }
    }
  }
}
```
---
