## **Project Overview**

### **What is TableBook?**

`TableBook` is a declarative TypeScript library designed to streamline the creation of spreadsheet-like structures. With a focus on vertical relationships and column-based computations, `TableBook` avoids traditional spreadsheet complexities like cell addresses or horizontal dependencies. This makes it ideal for generating consistent, maintainable table structures programmatically.

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

### **Table of Contents**
1. [Result](#result)
2. [TableBookIssue](#tablebookissue)
3. [TableSelector](#tableselector)
4. [TableStyle](#tablestyle)
5. [TableTheme](#tabletheme)
6. [TableColumnType](#tablecolumntype)
7. [TableColumn](#tablecolumn)
8. [TableGroup](#tablegroup)
9. [TablePage](#tablepage)
10. [TableDefinitions](#tabledefinitions)
11. [TableBook](#tablebook)

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
