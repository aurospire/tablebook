<p align="center">
  <img src="logo.png" width="100px" align="center" alt="TableBook Logo" />
  <h1 align="center">TableBook</h1>
  <p align="center"><i>Generate spreadsheets with a declarative and structured table-based schema.</i><p>
</p>

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
      "rows": 100,
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
      ]
    }
  ];
}`;

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

## **Types of TableBook**

> **Note**: This section covers all types, structures, and concepts that form the declarative schema of a `TableBook`.

### Table of Contents

1. [TableSelector](#1-tableselector)  
2. [TableReference](#2-tablereference)  
3. [TableStyle](#3-tablestyle)  
4. [TableHeaderStyle](#4-tableheaderstyle)  
5. [TableTheme](#5-tabletheme)  
6. [StandardPalette](#6-standardpalette)  
7. [TableExpressions](#7-tableexpressions)  
8. [TableDataType](#8-tabledatatype)  
   - [8.1 TableConditionalStyle](#81-tableconditionalstyle)  
   - [8.2 Rules Overview](#82-rules-overview)       
   - [8.3 Text Type (`TableTextType`)](#83-text-type-tabletexttype)  
   - [8.4 Enum Type (`TableEnumType`)](#84-enum-type-tableenumtype)  
   - [8.5 Lookup Type (`TableLookupType`)](#85-lookup-type-tablelookuptype)  
   - [8.6 Numeric Type (`TableNumericType`)](#86-numeric-type-tablenumerictype)  
   - [8.7 Temporal Type (`TableTemporalType`)](#87-temporal-type-tabletemporaltype)  
9. [TableUnit and Hierarchical Structure](#9-tableunit-and-hierarchical-structure)


---

## **1. TableSelector**

A **TableSelector** is how `TableBook` references data in a specific column and row subset. It always selects:
1. A **column** (either by page/group/name or some partial subset).
2. A **row filter** (self, all, absolute index, relative index, or a range).

This approach avoids typical spreadsheet cell references (like `A1`) in favor of logical references that get translated into final A1 notation when generating the spreadsheet.

---

### **1.1 How TableSelectors Work**

A `TableSelector` can be:
- **`"self"`** – meaning the current column and row in context,
- **An object** with two parts: `column` and `rows`.

Inside the object form:
- **`column`** can be:
  - `"self"` – to indicate the current column,
  - or a **`TableColumnSelector`** that refers to a column by `page`, `group`, and `name`.
- **`rows`** can be:
  - `"self"` – meaning the current row,
  - `"all"` – meaning every data row in that column,
  - a **unit** (like `"$0"`, `"+2"`, or `"-1"`),
  - or a **range** (like `{ from: "$0", to: "$4" }`).

Thus, you always have a single column plus whichever rows you specify.

---

### **1.2 Column Reference: Absolute vs. Relative**

A `TableColumnSelector` can fully or partially qualify where the column resides:

```typescript
type TableColumnSelector = {
  page?: string;  // optional page
  group?: string; // optional group, if page is included
  name: string;   // the column name
};
```

- **Fully Qualified**: `{ page: "Summary", group: "Revenue", name: "Sales" }`
  - Points to `"Sales"` in the `"Revenue"` group on the `"Summary"` page.
- **Partially Qualified**: `{ group: "Revenue", name: "Sales" }`
  - Points to `"Sales"` in `"Revenue"` (on the current page).
- **Name Only**: `{ name: "Sales" }`
  - Points to `"Sales"` in the **current group** and **current page**.

---

### **1.3 Row Reference: Self, All, Unit, or Range**

A `TableRowSelector` indicates which rows to include in the selection:

- **`"self"`**  
  – The current row in context. If you’re defining an expression inside a cell, `"self"` means “this exact row.”

- **`"all"`**  
  – Every data row in that column.

- **Unit Selector**: `$n`, `+n`, `-n`  
  - `"$0"`: The first data row (absolute).  
  - `"$3"`: The 4th data row.  
  - `"+2"`: Two rows below the current row.  
  - `"-1"`: One row above the current row.

- **Range Selector**: `{ from: TableUnitSelector, to: TableUnitSelector }`
  - `{ from: "$0", to: "$4" }`: Rows 0 through 4 (inclusive).

---

### **1.4 Single vs. Multiple Column Groups**

**Single Group**: If a page has only one group, the top row is the column header, and data starts at row 2 in A1 terms.  
**Multiple Groups**: If a page has multiple groups, row 1 is the group header, row 2 is the column header, and data starts at row 3 in A1 terms.

Hence, `$0` → `A2` in a single-group layout, `$0` → `A3` in a multi-group layout.

---

### **1.5 Examples**

1. **Selector with All Rows of “Sales”**  
   ```typescript
   { column: { name: "Sales" }, rows: "all" }
   ```
   Targets every row in the `Sales` column in the current group/page.

2. **Fully Qualified Selector**  
   ```typescript
   {
     column: { page: "Summary", group: "Revenue", name: "Sales" },
     rows: "$0"
   }
   ```
   The very first data row of the `Sales` column on the `Summary` page, `Revenue` group.

3. **Relative Offset**  
   ```typescript
   {
     column: { name: "Profit" },
     rows: "+1"
   }
   ```
   One row below the current row in the `Profit` column.

4. **Range**  
   ```typescript
   {
     column: { name: "Sales" },
     rows: { from: "$0", to: "$4" }
   }
   ```
   Rows 0 through 4 (inclusive) of `Sales`.

5. **Self**  
   ```typescript
   "self"
   ```
   Refers to the exact column and row in context.

---

### **1.6 Key Takeaways**

- A **TableSelector** always references **one column** + a row subset.
- Columns can be **fully qualified** or **relative** to the current context.
- Rows can be **self** (current row), **all**, **absolute/relative** units, or **ranges**.
- Single vs. multiple column groups slightly changes how `$n` translates to A1 notation, but that’s handled automatically during generation.

---
---

## **2. TableReference**

The `TableReference` type enables reusable definitions in `TableBook`. It allows you to reference shared elements like colors, styles, or themes, ensuring consistency across your table schema.

#### **Definition**
```typescript
type TableReference = `@${string}`;
```

#### **Concept**
- A `TableReference` starts with `@`, followed by the key of the referenced item.
- These references point to predefined entries in the `definitions` object of the `TableBook`.

---
---

## **3. TableStyle**

The `TableStyle` type defines visual styling for text and backgrounds. It is a reusable element that can be applied wherever specific styling is required in a `TableBook`.

#### **TableColor**
A `TableColor` is a 6-digit hexadecimal color code that defines fixed colors.

```typescript
type TableColor = `#${string}`;
```

#### **TableStyle**
The `TableStyle` type allows customization of text and background appearance.

```typescript
type TableStyle = {
    fore?: TableColor | TableReference; // Text color.
    back?: TableColor | TableReference; // Background color.
    bold?: boolean;                     // Whether the text is bold.
    italic?: boolean;                   // Whether the text is italicized.
};
```
---
---

## **4. TableHeaderStyle**

The `TableHeaderStyle` type extends `TableStyle` to include border options. It is specifically used for styling table headers, such as group or column headers, to enhance visual structure.

---

#### **4.1 Definition**

```typescript
type TableHeaderStyle = TableStyle & {
    beneath?: TableBorder;  // Border beneath the header.
    between?: TableBorder;  // Border between groups or columns.
};
```

---

#### **4.2 TableBorder**

The `TableBorder` type defines the appearance of a border.

##### **Definition**
```typescript
type TableBorder = {
    type: TableBorderType;              // The line style of the border.
    color: TableColor | TableReference; // The color of the border.
};
```

##### **TableBorderType**
Represents the available styles for border lines:
```typescript
type TableBorderType =
    "none"  | 
    "thin"  | "medium" | "thick"  |
    "dotted"| "dashed" | "double";
```

---
---

## **5. TableTheme**

A **TableTheme** defines coordinated styling for multiple areas - tabs, group headers, column headers, and data cells.
You can apply a theme at different levels of a `TableBook` (book → page → group → column), with each level either using or refining the theme from above.

#### **5.1 Definition**

```typescript
type TableTheme = {
  inherits?: TableReference[];
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

#### **5.2 Flow from Book → Page → Group → Column**

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

#### **5.3 Example: Setting a Book Theme**

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

#### **5.4 Default Book Theme**

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
---

## **6. StandardPalette**

**StandardPalette** provides a set of built-in color palettes, each containing five shades: `darkest`, `dark`, `base`, `light`, and `lightest`. You can reference an entire palette as a **theme** (e.g., `"@red"`) or reference its individual color shades (e.g., `"@red:darkest"`).

### **Using a Predefined Theme**

When you reference a palette by name for a **theme** (e.g., `"theme": "@blue"`), it brings in that entire palette for tab, group, header, and data. Specifically:

- `tab` gets the **base** color,
- `group.back` gets the **darkest** color,
- `header.back` gets the **dark** color,
- `data.back` gets the **lightest** color.

### **Using a Palette for a Specific Color**

If you want to use just a single shade from a palette in a style property (e.g. `fore` or `back`), you can specify `"@palette:shade"`. For example, `"@blue:darkest"`, `"@blue:light"`, etc. If you reference simply `"@blue"` as a color (without `:shade`), you get the **base** color of the palette.

### **Built-In Palettes**

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

### **Examples**

1. **Use a Full Palette as a Theme**  
   ```json
   {
     "name": "Report",
     "theme": "@blue",
     "pages": [ ... ]
   }
   ```
   This automatically applies the darkest, dark, base, lightest shades to `group.back`, `header.back`, `tab`, and `data.back` respectively.

2. **Reference a Specific Shade**  
   ```json
   {
     "theme": {
       "group": { "back": "@blue:darkest" },
       "header": { "fore": "#FFFFFF", "back": "@blue:dark" },
       "data": { "back": "@blue:lightest" }
     }
   }
   ```
   This picks out specific colors (`darkest`, `dark`, `lightest`) from the `blue` palette.

---
---

## **7. TableExpressions**

Expressions in `TableBook` are used to define structured formulas, replacing traditional spreadsheet cell references (e.g., `A1:B5`) with precise column-row relationships via `TableSelectors`. These formulas allow for consistent, column-based computations that translate into spreadsheet formulas during generation.

#### **7.1 Definition**

```typescript
type TableExpression =
  | TableLiteralExpression
  | TableSelectorExpression
  | TableCompoundExpression
  | TableNegatedExpression
  | TableFunctionExpression
  | TableTemplateExpression
  ;
```

---

#### **7.2 TableLiteralExpression**

The simplest type of expression, a `TableLiteralExpression`, represents a fixed value (number, string, or boolean).

##### **Definition**
```typescript
type TableLiteralExpression = {
    type: "literal";
    value: string | number | boolean;
};
```

##### **Example**
```typescript
const literalExpression: TableLiteralExpression = {
  type: "literal",
  value: 42
};
```

This translates to the literal value `42` in a formula.

---

#### **7.3 TableSelectorExpression**

A `TableSelectorExpression` references data in a specific column and row. Instead of traditional spreadsheet ranges, it uses a `TableSelector` to target the data.

##### **Definition**
```typescript
type TableSelectorExpression = {
    type: "selector";
    selector: TableSelector;
};
```

##### **Example**
```typescript
const selectorExpression: TableSelectorExpression = {
  type: "selector",
  selector: {
    column: { name: "Revenue" },
    rows: "$5"
  }
};
```

This references the `Revenue` column, specifically the 5th row - or 6 in A1 addressing.

---

#### **7.4 TableCompoundExpression**

A `TableCompoundExpression` combines multiple expressions using an operator. It supports both comparison and arithmetic/merge operators.

##### **Definition**
```typescript
type TableCompoundExpression = {
    type: "compound";
    op: TableComparisonOperator | TableMergeOperator;
    items: TableExpression[];
};
```

##### **Available Operators**

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

##### **Example**
```typescript
const compoundExpression: TableCompoundExpression = {
  type: "compound",
  op: "+",
  items: [
    { type: "selector", selector: { column: { name: "Revenue" }, rows: "$0" } },
    { type: "literal", value: 100 }
  ]
};
```

If `Revenue` was column `C` (with no group header), this translates to `=$C$2 + 100`.

---

#### **7.5 TableNegatedExpression**

A `TableNegatedExpression` inverts the result of another expression.

##### **Definition**
```typescript
type TableNegatedExpression = {
    type: "negated";
    item: TableExpression;
};
```

##### **Example**
```typescript
const negatedExpression: TableNegatedExpression = {
  type: "negated",
  item: {
    type: "selector",
    selector: { column: { name: "Profit" }, rows: "self" }
  }
};
```

If `Profit` was column `B` (with no group header), this corresponds to `=-($B2)`

---

#### **7.6 TableFunctionExpression**

A `TableFunctionExpression` applies a named function to a list of arguments, which can be other expressions.

##### **Definition**
```typescript
type TableFunctionExpression = {
    type: "function";
    name: string;
    items: TableExpression[];
};
```

##### **Example**
```typescript
const functionExpression: TableFunctionExpression = {
  type: "function",
  name: "SUM",
  items: [
    { type: "selector", selector: { column: { page: 'Items', group: 'Info', name: 'Revenue' }, rows: "all" } },
    { type: "literal", value: 50 }
  ]
};
```

If `Revenue` was column `D` (with a group header), this translates to `SUM(Items!$D3:$D, 50)`.

---

#### **7.7 TableTemplateExpression**  

A `TableTemplateExpression` represents a formula written as literal text with placeholders (`vars`) that map to subexpressions. This enables dynamic, structured computation while preserving the relationships between table data.

##### **Definition**  

```typescript
type TableTemplateExpression = {
    type: "template";
    text: string;
    vars?: Record<string, TableExpression>;
};
```

##### **How `vars` Works**  
- The `text` property contains placeholders that **exactly match** keys in the `vars` object.  
- **The var name can be any string**—it does **not** need to start with `@`. If `text` has something like `COUNTIF($Revenue, ">50")`, then you'd define `vars` with a key like `$Revenue` (or any other name you used).
- During processing, each placeholder is replaced by the corresponding subexpression’s A1 reference or formula.

##### **Example**  

```typescript
const templateExpression: TableTemplateExpression = {
  type: 'template',
  text: 'COUNTIF(@Revenue, ">=50")',
  vars: {
    '@Revenue': {
      type: 'selector',
      selector: { column: { page: 'Items', group: 'Info', name: 'Revenue' }, rows: 'all' }
    }
  }
};
```

If `Revenue` was column `D` (with a group header), this translates to:  
`COUNTIF(Items!$D3:$D, ">=50")`.

---
---

## **8. TableDataType**

The `TableDataType` defines the type of data in a column. It determines how data is validated, formatted, and optionally styled conditionally. There are five main types:

```typescript
type TableDataType =
    | TableTextType
    | TableEnumType
    | TableLookupType
    | TableNumericType
    | TableTemporalType;
```

Each data type shares the following properties:

- **`kind`** *(required)*: A string that identifies the type of data (e.g., `"text"`, `"enum"`, `"numeric"`).
- **`style`** *(optional)*: A `TableStyle` or `TableReference` to a style defining how the column should be styled.
  - This merges with the current theme's data style, with the type's style attributes taking precedence.

---

#### **8.1 TableConditionalStyle**

The `TableConditionalStyle` type applies styling to data when a specific rule or condition is met. It is used in conjunction with rules for text, numeric, and temporal types.

```typescript
type TableConditionalStyle<Rule> = {
    when: Rule;
    style?: TableStyle | TableReference;
    color?: TableColor | TableReference;
};
```

###### Style Merging

The final style for a `TableConditionalStyle` (and `EnumItem`) is created from the style and/or color.
```typescript
(item.style ?? {}) + { fore: item.color }
```

---

#### **8.2 Rules Overview**

Rules (`TableRules`) define how values in a column are validated. Each type (text, numeric, temporal) has its own rule system, but all support custom rules using expressions.

---

##### **8.2.1 TableCustomRule**

A `TableCustomRule` defines advanced validation using expressions.

```typescript
type TableCustomRule = {
    type: "custom";
    expression: TableExpression;
};
```

---

##### **8.2.2 Text Rules** (`TableTextRule`)

Text rules validate string values.

```typescript
type TableTextRule =
    | TableMatchRule
    | TableCustomRule;
```

###### **Match Rules**
```typescript
type TableMatchRule = {
    type: "is" | "contains" | "begins" | "ends";
    value: string;
};
```

**Example:**
```typescript
const rule: TableTextRule = { type: "contains", value: "Important" };
```

---

##### **8.2.3 Numeric Rules** (`TableNumericRule`)

Numeric rules validate number values.

```typescript
type TableNumericRule =
    | TableComparisonRule<number>
    | TableRangeRule<number>
    | TableCustomRule;
```

###### **Comparison Rules**
```typescript
type TableComparisonRule<T> = {
    type: "=" | "<>" | ">" | "<" | ">=" | "<=";
    value: T;
};
```

###### **Range Rules**
```typescript
type TableRangeRule<T> = {
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

##### **8.2.4 Temporal Rules** (`TableTemporalRule`)

Temporal rules validate date and time values.

```typescript
type TableTemporalRule =
    | TableComparisonRule<TableTemporalString>
    | TableRangeRule<TableTemporalString>
    | TableCustomRule;
```

###### **Temporal String**
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

#### **8.3 Text Type** (`TableTextType`)

Represents string-based data.  

```typescript
type TableTextType = {
    kind: "text";
    style?: TableStyle | TableReference;
    styles?: TableConditionalStyle<TableTextRule>[];
    rule?: TableTextRule;
};
```
---

#### **8.4 Enum Type** (`TableEnumType`)

Represents data with a fixed set of allowed values.  
```typescript
type TableEnumType = {
    kind: "enum";
    style?: TableStyle | TableReference;
    items: TableEnumItem[];
};
```

##### **Enum Item**
An `EnumItem` defines an individual value in the enum and supports customizable styles or colors.

```typescript
type TableEnumItem = {
    name: string;
    description?: string;
    style?: TableStyle | TableReference;
    color?: TableColor | TableReference;
};
```
---

#### **8.5 Lookup Type** (`TableLookupType`)

References valid values from another column.  
```typescript
type TableLookupType = {
    kind: "lookup";
    style?: TableStyle | TableReference;
    styles?: TableConditionalStyle<TableTextRule>[];
    column: TableColumnSelector;
    rule?: TableTextRule; // NEW: optional validation rule for the looked-up text
};
```

---

#### **8.6 Numeric Type** (`TableNumericType`)

Represents numerical data, allowing for validation, formatting, and conditional styling.  

```typescript
type TableNumericType = {
    kind: "numeric";
    style?: TableStyle | TableReference;
    styles?: TableConditionalStyle<TableNumericRule>[];
    rule?: TableNumericRule;
    format?: TableNumericFormat | TableReference;
};
```
---

##### **8.6.1 TableBaseNumericFormat**

All numeric formats (`number`, `percent`, `currency`) inherit from the same base format options.

```typescript
type TableBaseNumericFormat<Type extends string> = {
    type: Type;
    integer?: number | TableDigitPlaceholder;
    decimal?: number | TableDigitPlaceholder;
    commas?: boolean;
};
```

---

##### **8.6.2 TableDigitPlaceholder**

`TableDigitPlaceholder` controls how digits are displayed using placeholder characters:

| Placeholder | Behavior                                                   |
|-------------|------------------------------------------------------------|
| `'0'`       | Fixed digit: always shows a digit, even if it's `0`.       |
| `'#'`       | Flexible digit: shows a digit if present, or nothing.      |
| `'?'`       | Aligning digit: shows a digit if present, or a space.      |

```typescript
type TableDigitPlaceholder = {
    fixed?: number;
    flex?: number;
    align?: number;
};
```

---

##### **8.6.3 Numeric Formats**

There are three specific numeric formats, each extending the base numeric format:

1. **Number Format**

    ```typescript
    type TableNumberFormat = TableBaseNumericFormat<"number">;
    ```

2. **Percent Format**

    ```typescript
    type TablePercentFormat = TableBaseNumericFormat<"percent">;
    ```

3. **Currency Format**

    ```typescript
    type TableCurrencyFormat = TableBaseNumericFormat<"currency"> & {
        symbol?: string;
        position?: "prefix" | "suffix";
    };
    ```

---

#### **8.7 Temporal Type** (`TableTemporalType`)

Represents date and time data, with flexible validation and customizable formatting.  

```typescript
type TableTemporalType = {
    kind: "temporal";
    style?: TableStyle | TableReference;
    styles?: TableConditionalStyle<TableTemporalRule>[];
    rule?: TableTemporalRule;
    format?: TableTemporalFormat | TableReference;
};
```

---

##### **8.7.1 Temporal Rules**

Temporal rules validate date and time values. They function similarly to numeric rules but operate on temporal strings (`YYYY-MM-DD`).

---

##### **8.7.2 TableTemporalUnit**

A `TableTemporalUnit` defines a single element of a temporal format, such as a year, month, day, or time component. Each unit can optionally specify a `length`, which determines whether the unit is displayed in a short or long format.

```typescript
type TableTemporalUnit = {
    type:
         | "year"
         | "month"
         | "monthname"
         | "weekday"
         | "day"
         | "hour"
         | "meridiem"
         | "minute"
         | "second"
         ;
    length?: "short" | "long";
};
```

Below is a more detailed look at each possible `type` within a `TableTemporalUnit`, with examples of “short” vs. “long” formats.

| **Type**    | **Description**                                        | **Short Example** | **Long Example**  |
|-------------|--------------------------------------------------------|-------------------|-------------------|
| **`year`**      | The year of the date.                                  | `25` (e.g. `yy`)  | `2025` (e.g. `yyyy`) |
| **`month`**     | The numeric month of the year.                         | `1` (`m`)         | `01` (`mm`)       |
| **`monthname`** | The textual month name.                               | `Jan`             | `January`         |
| **`weekday`**   | The name of the weekday.                              | `Mon`             | `Monday`          |
| **`day`**       | The day of the month.                                 | `7`  (`d`)        | `07` (`dd`)       |
| **`hour`**      | The hour (12-hour or 24-hour clock, depending on system). | `3` (`h`)         | `03` (`hh`)       |
| **`meridiem`**  | The AM/PM designator (if using 12-hour clock).        | `AM`              | `AM` (expanded)   |
| **`minute`**    | The minute of the hour.                               | `5`  (`m`)        | `05` (`mm`)       |
| **`second`**    | The second of the minute.                             | `3`  (`s`)        | `03` (`ss`)       |

When building a `TableTemporalFormat`, you combine these units (with optional literal strings in between). For example:
```json
[
  { "type": "monthname", "length": "short" },
  " ",
  { "type": "day", "length": "long" },
  ", ",
  { "type": "year", "length": "long" }
]
```
Might produce something like **`Jan 07, 2025`**.

---

##### **8.7.3 TableTemporalFormat**

A `TableTemporalFormat` is an array mixing literal strings and `TableTemporalUnit` objects.

```typescript
type TableTemporalFormat = (TableTemporalUnit | string)[];
```

---

#### **8.8 Key Takeaways**

1. **Text, Enum, Lookup, Numeric, Temporal**: Five distinct types, each with potential rules, formatting, and conditional styling.
2. **Conditional Styles**: Trigger color/bold/etc. changes when certain rules are met.
3. **Custom/Inherited Formats**: Numeric and temporal types can reference built-in or custom formats for consistent display.
4. **Flexible Validation**: Each type can have built-in rules or custom expression-based rules.

---
---

## **9. TableUnit and Hierarchical Structure**

The `TableUnit` type provides the foundation for defining a `TableBook`. This section covers each layer of the hierarchy—from the smallest element (**TableColumn**) to the root (**TableBook**)—and explains how **definitions** can be declared at each level to enable flexible, cascading reuse of styles, formats, and more.

---

#### **9.1 TableDefinitions**

A `TableUnit` can optionally declare `definitions` that store **reusable, named elements** such as colors, styles, themes, numeric/temporal formats, and column types. Each level (**column, group, page, book**) can define its own `definitions`, and references to these definitions cascade **upward** when a match isn't found locally.

Additionally, **definitions themselves can reference other definitions** using `TableReference`. This enables modular, hierarchical styling and formatting where:
- A **style** can refer to predefined colors.
- A **theme** can inherit from another theme.
- A **type** can reference a **format**.
- A **numeric format** can reference another numeric format.
- A **temporal format** can reference a pre-existing pattern.

This design allows for **cleaner, DRY configurations**, making it easy to create reusable building blocks.

---

##### **9.1.1 Definition**

```typescript
type TableReferenceMap<T> = Record<string, T | TableReference>;

type TableDefinitions = {
    colors?: TableReferenceMap<TableColor>;
    styles?: TableReferenceMap<TableHeaderStyle>;
    themes?: TableReferenceMap<TableTheme>;
    numerics?: TableReferenceMap<TableNumericFormat>;
    temporals?: TableReferenceMap<TableTemporalFormat>;    
    types?: TableReferenceMap<TableDataType>;    
};
```

---

##### **9.1.2 Example**

```json
{
  "definitions": {
    "colors": {
      "warning": "#FFA500",
      "danger": "#FF0000",
      "alert": "@danger"
    },
    "styles": {
      "boldHeader": { "fore": "#FFFFFF", "back": "#0000FF", "bold": true },
      "alertHeader": { "fore": "@alert", "bold": true }
    },
    "themes": {
      "corporate": { "inherits": ["@blue"], "header": "@boldHeader" }
    },
    "numerics": {
      "currency": { "type": "currency", "symbol": "$", "position": "prefix" },
      "usd": "@currency"
    },
    "temporals": {
      "shortDate": [
        { "type": "monthname", "length": "short" },
        " ",
        { "type": "day" },
        ", ",
        { "type": "year" }
      ],
      "usFormat": "@shortDate"
    },
    "types": {
      "currencyColumn": { "kind": "numeric", "format": "@usd" }
    }
  }
}
```

---

#### **9.2 TableUnit**

All elements in a `TableBook` (columns, groups, pages, and the book itself) extend `TableUnit`. It holds common properties like a name, optional theme, an optional description, and the optional `definitions`.

```typescript
type TableUnit = {
  name: string; // must match TableUnitNameRegex
  theme?: TableTheme | TableReference;
  description?: string;
  definitions?: TableDefinitions;
};
```

> **Regex**: The `TableUnitNameRegex` is `^[A-Z][A-Za-z0-9_]*$`, meaning the name must start with an uppercase letter followed by alphanumeric characters or underscores.

---

#### **9.3 TableColumn**

A `TableColumn` represents the smallest unit in a `TableBook`. It extends `TableUnit` and includes properties for data typing and optional expressions.

```typescript
type TableColumn = TableUnit & {
  type: TableDataType | TableReference;
  source?: string;
  expression?: TableExpression;
};
```

---

#### **9.4 TableGroup**

A `TableGroup` organizes multiple `TableColumn` elements into a logical set (e.g., financial columns vs. operational columns). Groups also extend `TableUnit`, so they can have their own definitions, theme, or description.

```typescript
type TableGroup = TableUnit & {
  columns: TableColumn[];
};
```

---

#### **9.5 TablePage**

A `TablePage` represents a **single sheet** within a `TableBook`. Every page has **one table** made up of groups and columns.

```typescript
type TablePage = TableUnit & {
  groups: TableGroup[];
  rows: number;
};
```

---

#### **9.6 TableBook**

A `TableBook` is the **root** container, holding an array of pages. It extends `TableUnit` so it can also specify **global** definitions, themes, or descriptions.

```typescript
type TableBook = TableUnit & {
  pages: TablePage[];
};
```

---

#### **Key Takeaways**
1. **Local Definitions at Every Level**: Each `TableUnit` can define its own `definitions`, enabling flexible, localized overrides or additions.
2. **Upward Cascading**: If a referenced definition isn’t found locally, the search continues up the hierarchy.
3. **Consistent Column-Based Design**: Each page holds exactly one table, defined by groups and columns, with row count determined by the page’s `rows` property.
4. **Unified `TableUnit`**: Common properties (`name`, `theme`, `description`, `definitions`) ensure consistent behavior and the ability to override settings at any level.

---
---

## **TableBook Functions & Utilities**

> **This section covers the operational side of TableBook: Results, Issues, Parsing, Validation, Processing, and Generation.**

### 10. Result

The `Result` type represents the outcome of an operation, which can either succeed or fail. It is a generic utility type, parameterized by:
- `T`: The type of the value when the operation is successful.
- `I`: The type of the additional information when the operation fails.

#### **Definition**
```typescript
type Result<T, I> =
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

- **`Result.isResult(value: any): boolean`**
  Checks if an object is a `Result`.

---
---

### 11. TableBookIssue

The `TableBookIssue` type represents errors or warnings encountered while working with `TableBook` objects. It is a union type covering issues from four distinct phases:
- Parsing
- Validation
- Processing
- Generation

#### **Definition**
```typescript
type TableBookIssue = 
    | TableBookParseIssue
    | TableBookValidateIssue
    | TableBookProcessIssue
    | TableBookGenerateIssue;
```

Each issue type contains unique fields based on its context.

---

#### **11.1 TableBookParseIssue**
Represents issues encountered during the **parsing phase** (e.g., invalid JSON/YAML syntax).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'parsing'`         | Indicates the parsing phase.              |
| `message`     | `string`            | Descriptive message about the issue.      |
| `location`    | `TextLocation`      | Location (line/column) of the issue.      |
| `length`      | `number`            | Length of the problematic text segment.   |

##### **Example**
```typescript
const issue: TableBookParseIssue = {
  type: "parsing",
  message: "Unexpected token",
  location: { index: 15, line: 2, column: 6 },
  length: 1
};
```

---

#### **11.2 TableBookValidateIssue**
Represents issues encountered during the **validation phase** (e.g., schema violations).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'validating'`      | Indicates the validation phase.           |
| `message`     | `string`            | Descriptive message about the issue.      |
| `path`        | `ObjectPath`        | Path to the problematic data.             |
| `value`       | `any` (optional)    | The invalid value that caused the issue.  |

##### **Example**
```typescript
const issue: TableBookValidateIssue = {
  type: "validating",
  message: "Invalid type: expected numeric",
  path: ["page1", "Revenue", "Price"],
  value: "NotANumber"
};
```

---

#### **11.3 TableBookProcessIssue**
Represents issues encountered during the **processing phase** (e.g., resolving references).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'processing'`      | Indicates the processing phase.           |
| `message`     | `string`            | Descriptive message about the issue.      |
| `path`        | `ObjectPath`        | Path to the problematic data.             |
| `data`        | `any`               | Contextual data about the issue.          |

##### **Example**
```typescript
const issue: TableBookProcessIssue = {
  type: "processing",
  message: "Reference not found: @Revenue",
  path: ["page1", "Revenue"],
  data: { reference: "@Revenue" }
};
```

---

#### **11.4 TableBookGenerateIssue**
Represents issues encountered during the **generation phase** (e.g., external generator errors).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'generating'`      | Indicates the generation phase.           |
| `message`     | `string`            | Descriptive message about the issue.      |
| `data`        | `any`               | Contextual data about the issue.          |

##### **Example**
```typescript
const issue: TableBookGenerateIssue = {
  type: "generating",
  message: "Failed to connect to Google Sheets API",
  data: { errorCode: 401, reason: "Unauthorized" }
};
```

---

#### **Handling TableBook Issues**

When working with `TableBook`, operations like parsing, validating, processing, or generating return `Result` types. Use the `info` field to inspect `TableBookIssue` objects when an operation fails.

##### **Example**
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

### **12. `tablebook` Functions

The `tablebook` object includes utilities for parsing, validating, processing, and generating `TableBook` objects. Here's a breakdown:

---

#### **12.1 tablebook.parse**

Parses a `TableBook` from a JSON or YAML string.

##### **Definition**
```typescript
tablebook.parse(format: 'json' | 'yaml', data: string): TableBookParseResult;
```

##### **Example**
```typescript
const result = tablebook.parse('json', '{"name": "Report", "pages": []}');

if (result.success)
    console.log('Parsed successfully:', result.value);
else
    console.error('Parse issues:', result.info);
```

---

#### **12.2 tablebook.validate**

Validates a `TableBook` against its schema.

##### **Definition**
```typescript
tablebook.validate(data: any): TableBookValidateResult<TableBook>;
```

##### **Example**
```typescript
const validationResult = tablebook.validate(parsedTableBook);

if (validationResult.success)
    console.log('Validation passed.');
else
    console.error('Validation issues:', validationResult.info);
```

---

#### **12.3 tablebook.process**

Processes a `TableBook` to resolve references and prepare it for generation. This step converts the declarative `TableBook` schema into a `SheetBook`, which is an intermediate representation (IR) closer to the final spreadsheet output.

##### **What is a `SheetBook`?**

A `SheetBook` mimics the hierarchical structure of a `TableBook` (with pages, groups, and columns) but resolves all references and removes the `TableBook` paradigm, such as constrained types and relationships. Instead, it uses:
- **Concrete Numeric Addresses**: Columns and rows are mapped to absolute numbers (like `type SheetPosition = { col: number; row: number; }`)
- **No Set Types**: Unlike `TableBook`, `SheetBook` imposes no constraints on the types or formats of data.
- **Flexible Validation and Styles**: Therefore, any kind of validation, conditional styling, or formatting can be applied to any column.

Think of the `SheetBook` as an IR (Intermediate Representation) that abstracts away the declarative `TableBook` model for practical use in spreadsheet generation.

##### **Definition**
```typescript
tablebook.process(data: TableBook, options: TableBookProcessOptions = {}): TableBookProcessResult<SheetBook> {
```

```typescript
export type TableBookProcessOptions = {
    /** Custom resolvers for missing references like themes, colors, or types. */
    resolvers?: TableDefinitionResolver[];
    /** Excludes the StandardPaletteResolver.theme if true. Default is false. */
    omitStandardThemes?: boolean;
    /** Excludes the StandardPaletteResolver.colors if true. Default is false. */
    omitStandardColors?: boolean;
    /** Logger for tracking processing progress. */
    logger?: TableProcessLogger;
};
```

##### **TableProcessLogger**

Tracks processing progress at each level of the hierarchy.

```typescript
type TableProcessLogger = {
    book?: (book: TableBook) => void;
    page?: (page: TablePage) => void;
    group?: (group: TableGroup) => void;
    column?: (column: TableColumn) => void;
};
```

##### **Example Logger**
```typescript
const logger: TableProcessLogger = {
    page: page => console.log(`Processing page: ${page.name}`),
    column: column => console.log(`Processing column: ${column.name}`)
};
```

##### **Example Usage**
```typescript
const processResult = tablebook.process(tableBook, { logger });

if (processResult.success)
    console.log('Processed SheetBook:', processResult.value);
else
    console.error('Processing issues:', processResult.info);
```

---

#### **12.4 tablebook.generate**

Generates output from a processed `SheetBook`.

##### **Definition**
```typescript
tablebook.generate(
  data: SheetBook,
  generator: SheetGenerator
): Promise<TableBookGenerateResult>;
```

##### **Example**
```typescript
const googleGenerator = await tablebook.generators.google(email, apiKey, sheetId, reset);
const generateResult = await tablebook.generate(sheetBook, googleGenerator);

if (generateResult.success)
    console.log('Generation successful.');
else
    console.error('Generation issues:', generateResult.info);
```
---

#### **12.5 tablebook.generators**

The `generators` object provides methods to create output generators for converting a processed `SheetBook` into a spreadsheet. It simplifies the integration with external systems by abstracting the complexity of connecting to APIs or managing file formats.

---

#### **12.5.1 tablebook.generators.google**

Creates a Google Sheets generator for exporting to a specified sheet.

##### **Definition**
```typescript
tablebook.generators.google(
  email: string,
  key: string,
  sheetId: string,
  reset: boolean
): Promise<SheetGenerator>;
```

##### **Parameters**
- **`email`**: The service account email used to authenticate with the Google Sheets API.
- **`key`**: The API key or private key associated with the service account.
- **`sheetId`**: The unique identifier of the target Google Sheet.
- **`reset`**: If `true`, clears all existing content in the sheet before writing new data.

---

##### **Example**
```typescript
const generator = await tablebook.generators.google(
    'api-user@example.com',
    'API_KEY',
    'SHEET_ID',
    true
);

const generateResult = await tablebook.generate(sheetBook, generator);

if (generateResult.success)
    console.log('Sheet successfully generated!');
else
    console.error('Generation issues:', generateResult.info);
```

---

#### **Future Goals**
- **Support for OAuth Authentication**: Extend `.google` to support OAuth flows, enabling end-user authentication in addition to service accounts.
- **Excel Support**: Add a generator method (e.g., `.excel`) for exporting `SheetBook` objects directly to `.xlsx` files, ensuring compatibility with non-Google spreadsheet systems.
