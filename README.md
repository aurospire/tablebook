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

## **Types and Methods Guide and Reference**

### Table of Contents

1. [TableSelector](#1-tableselector)
2. [TableReference](#2-tablereference)
3. [TableStyle](#3-tablestyle)
4. [TableHeaderStyle](#4-tableheaderstyle)
5. [TableTheme](#5-tabletheme)
6. [TableExpressions](#6-tableexpressions)
7. [TableDataTypes](#7-tabledatatype)
8. [TableUnit and Hierarchical Structure](#8-tableunit-and-hierarchical-structure)    
9. [Result](#9-result)
10. [TableBookIssue](#10-tablebookissue)   
11. [`tablebook` Functions](#11-tablebook-functions)
---

## **1. TableSelector**

`TableSelector` provides a structured way to reference specific columns and rows in a `TableBook`. It ensures clarity and flexibility by using logical references instead of direct cell addresses (e.g., `A1:B5`). These logical references are later translated into A1-style spreadsheet references during generation.

---

### **Key Concepts**
1. **Column-Based Selection Only**: Unlike traditional spreadsheets, `TableBook` does not support cell-based or horizontal (multi-column) selection. All data selection is **column-centric**, targeting one column at a time.
2. **Page → Group → Column** paradigm: Columns are identified within a hierarchy:
   - **Page**: Synonymous with a `Table`, representing a single table within the spreadsheet. Each `Page` in the `TableBook` corresponds to one logical table, forming the core unit of the "book of tables."
   - **Group**: A subgroup within a page that organizes related columns.
   - **Column**: The specific column within a group.

### **1.1 TableSelector Types**

A `TableSelector` can reference either the current column and row (`"self"`) or a specific combination of a column and rows.

#### **Type Definitions**
```typescript
type TableSelector = 
  | TableSelfSelector
  | {
      column: TableColumnSelector | TableSelfSelector;
      rows: TableRowSelector | TableSelfSelector;
  };
```

#### **1.1.1 TableSelfSelector**
```typescript
type TableSelfSelector = "self";
```
- Refers to the **current column** and/or **row** in context.  

#### **1.1.2 TableColumnSelector**
```typescript
type TableColumnSelector = {
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

#### **1.1.3 TableRowSelector**
```typescript
type TableRowSelector = 
  | TableUnitSelector
  | TableRangeSelector
  | TableAllSelector
  | TableSelfSelector;
```

##### **TableUnitSelector**
```typescript
type TableUnitSelector = `$${number}` | `+${number}` | `-${number}`;
```
- **`$n`**: Absolute, zero-based row within the data region.  
- **`+n`**: Row offset forward from the current row.  
- **`-n`**: Row offset backward from the current row.

##### **TableRangeSelector**
```typescript
type TableRangeSelector = {
  from: TableUnitSelector;
  to: TableUnitSelector;
};
```
- Selects a range of rows between two positions (inclusive).

##### **TableAllSelector**
```typescript
type TableAllSelector = "all";
```
- Selects all rows in the specified column.

---

### **1.2 Single Group vs. Multiple Groups**

The structure of a table depends on whether it has **one group** or **multiple groups** of columns.

#### **Single Group Example**
| **Row** | **A**        | **B**      | **C**        |
|---------|--------------|------------|--------------|
| **1**   | **Sales**    | **Cost**   | **Profit**   |
| **2**   | Data Row 1   | Data Row 1 | Data Row 1   |
| **3**   | Data Row 2   | Data Row 2 | Data Row 2   |

- **Row 1**: Column headers.  
- **Row 2 onward**: Data rows.

**Key Rule**: The first data row corresponds to **logical `$0`**, which maps to A1-address row **2**.

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

**Key Rule**: The first data row corresponds to **logical `$0`**, which maps to A1-address row **3**.

---

#### **1.3 Translating Selectors to A1 Notation**

##### **Translation Rules**
1. **Columns**:
   - Columns are mapped to spreadsheet letters (e.g., `"Sales"` → `A`).
2. **Rows**:
   - `$n` corresponds to the **nth data row** in TableBook logic:
     - Row 2 in A1 for single groups.
     - Row 3 in A1 for multiple groups.

##### **Examples**

###### **1. Column Selector with All Rows**
```typescript
{ column: { name: "Sales" }, rows: "all" }
```
- Logical: All rows in `"Sales"`.
- A1 Translation (If Sales is Column 0):
  - Single group: `$A2:$A`.
  - Multiple groups: `$A3:$A`.

---

###### **2. Fully Qualified Selector with Absolute Row**
```typescript
{
  column: { page: "Summary", group: "Revenue", name: "Sales" },
  rows: "$0"
}
```
- Logical: First data row in `"Sales"` on `"Summary"`.
- A1 Translation: `Summary!$A$2` (single group) or `Summary!$A$3` (multiple groups).

---

###### **3. Relative Row Offset**
```typescript
{
  column: { name: "Profit" },
  rows: "+1"
}
```
- Logical: Row one step below the current row in `"Profit"`.
- A1 Translation (if current row is `$2`): `$C4`.

---

###### **4. Range of Rows**
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

###### **5. Self-Selector**
```typescript
"self"
```
- Logical: Current column and row.
- A1 Translation: Context-dependent (e.g., `$A2` if in column `"Sales"` and row `$0`).

---

#### **1.4 Key Takeaways**

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

### **2. TableReference**

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

### **3. TableStyle**

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

### **4. TableHeaderStyle**

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
    "thin"  | "medium" | "thick",  // single line style of different thickness
    "dotted"| "dashed" | "double"  // alternative lines styles
    ;
```
---
---

### **5. TableTheme**

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

#### **5.3 Built-In Palettes**

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
Best is to define it globally in the Book theme.


---

#### **5.4 Example: Setting a Book Theme**

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

#### **5.5 Default Book Theme**

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

#### **5.6 Key Points**

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

### **6. TableExpressions**

Expressions in `TableBook` are used to define structured formulas, replacing traditional spreadsheet cell references (e.g., `A1:B5`) with precise column-row relationships via `TableSelectors`. These formulas allow for consistent, column-based computations that translate into spreadsheet formulas during generation.

#### **6.1 Definition**

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

#### **6.2 TableLiteralExpression**

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

#### **6.3 TableSelectorExpression**

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

#### **6.4 TableCompoundExpression**

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
    { type: "selector", from: { column: { name: "Revenue" }, rows: "$0" } },
    { type: "literal", of: 100 }
  ]
};
```

If `Revenue` was column `C` (with no group header), this translates to `=$C$2 + 100`.

---

#### **6.5 TableNegatedExpression**

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

#### **6.6 TableFunctionExpression**

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
    { type: "selector", from: { column: { page: 'Items', group: 'Info', name: "Revenue" }, rows: "all" } },
    { type: "literal", of: 50 }
  ]
};
```

If `Revenue` was column `D` (with a group header), this translates to `SUM(Items!$D3:$D, 50)`.

---

#### **6.7 TableTemplateExpression**  

A `TableTemplateExpression` represents a formula written as literal text with placeholders (`vars`) that map to subexpressions. This enables dynamic, structured computation while preserving the relationships between table data.

##### **Definition**  

```typescript
type TableTemplateExpression = {
    type: "template";
    text: string;                           // Formula text containing placeholders.
    vars?: Record<string, TableExpression>; // Placeholders mapped to expressions.
};
```

##### **Example**  

```typescript
const templateExpression: TableTemplateExpression = {
  type: 'template',
  text: 'COUNTIF(@Revenue, ">=50")',
  vars: {
    '@Revenue': {
      type: 'selector',
      from: { column: { page: 'Items', group: 'Info', name: 'Revenue' }, rows: 'all' }
    }
  }
};
```

If `Revenue` was column `D` (with a group header), this translates to:  
`COUNTIF(Items!$D3:$D, ">=50")`.

---

#### **How It Works**  

1. **Template (`text` field)**:  
   - The `text` field is a formula string that includes placeholders.  
   - A placeholder can be any string, but it must exactly match a key in `vars`.

2. **Variables (`vars` object)**:  
   - `vars` maps placeholders to expressions.  
   - Every placeholder in `text` **must** have a corresponding key in `vars`.  
   - The placeholders do **not** have to follow any specific naming convention (`@Revenue` is just one example).  

This allows for dynamic formula generation while ensuring that every placeholder is backed by a structured table expression.

---
---

### **7. TableDataType**

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

#### **7.1 TableConditionalStyle**

The `TableConditionalStyle` type applies styling to data when a specific rule or condition is met. It is used in conjunction with rules for text, numeric, and temporal types.

```typescript
type TableConditionalStyle<Rule> = {
    when: Rule;                              // The rule to trigger this style.
    style?: TableStyle | TableReference;     // The optional style to apply if the rule is satisfied.
    color?: TableColor | TableReference;     // The optional forecolor shorthand to apply if the rule is satisfied
};
```
###### Style Merging

The final style for an `TableConditionalStyle` (and `EnumItem`) is created from the style and/or color.
```typescript
(item.style ?? {}) + { fore: item.color }
```

For example, if `item.style` is 
```typescript
{ bold: true, back: '#fffffff', fore: '#000000' }
```
and `item.color` is 
```typescript
'#222222'
```
The final `EnumItem` style will be
```typescript
{ bold: true,  back: '#fffffff', fore: '#222222 }
```

---

#### **7.2 Rules Overview**

Rules (`TableRules`) define how values in a column are validated. Each type (text, numeric, temporal) has its own rule system, but all support custom rules using expressions.

---

##### **7.2.1 TableCustomRule**

A `TableCustomRule` defines advanced validation using expressions.

```typescript
type TableCustomRule = {
    type: "custom";
    expression: TableExpression;
};
```

---

##### **7.2.2 Text Rules** (`TableTextRule`)

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

##### **7.2.3 Numeric Rules** (`TableNumericRule`)

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

##### **7.2.4 Temporal Rules** (`TableTemporalRule`)

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

#### **7.3 Text Type** (`TableTextType`)

Represents string-based data.  

```typescript
type TableTextType = {
    kind: "text";
    style?: TableStyle | TableReference;                // Base style
    styles?: TableConditionalStyle<TableTextRule>[];    // Conditional styling
    rule?: TableTextRule;                               // Validation rule
};
```
---

#### **7.4 Enum Type** (`TableEnumType`)

Represents data with a fixed set of allowed values.  
```typescript
type TableEnumType = {
    kind: "enum";
    style?: TableStyle | TableReference;          // Base style
    items: TableEnumItem[];                       // Possible values
};
```

##### **Enum Item**
An `EnumItem` defines an individual value in the enum and supports customizable styles or colors.
Conditional styling and validation is build in

```typescript
type TableEnumItem = {
    name: string;                             // The value of the enum item
    description?: string;                     // Optional description for the item
    style?: TableStyle | TableReference;      // The optional style to apply for the enum item.
    color?: TableColor | TableReference;      // The optional forecolor shorthand to apply for the enum itm
};
```
---

#### **7.5 Lookup Type** (`TableLookupType`)

References valid values from another column.  
```typescript
type TableLookupType = {
    kind: "lookup";
    style?: TableStyle | TableReference;                // Base style
    styles?: TableConditionalStyle<TableTextRule>[];    // Conditional styling
    column: TableColumnSelector;                        // Column referencing valid values
};
```

---

#### **7.6 Numeric Type** (`TableNumericType`)

Represents numerical data, allowing for validation, formatting, and conditional styling.  

```typescript
type TableNumericType = {
    kind: "numeric";
    style?: TableStyle | TableReference;               // Base style
    styles?: TableConditionalStyle<TableNumericRule>[];// Conditional styling
    rule?: TableNumericRule;                           // Validation rule
    format?: TableNumericFormat | TableReference;      // Formatting options
};
```
---

##### **7.6.1 TableBaseNumericFormat**

All numeric formats (`number`, `percent`, `currency`) inherit from the same base format options.

```typescript
type TableBaseNumericFormat<Type extends string> = {
    type: Type;                               // The format type (e.g., "number", "percent")
    integer?: number | TableDigitPlaceholder; // Formatting for digits before the decimal
    decimal?: number | TableDigitPlaceholder; // Formatting for digits after the decimal
    commas?: boolean;                         // Whether to separate thousands with commas
};
```

---

##### **7.6.2 TableDigitPlaceholder**

`TableDigitPlaceholder` controls how digits are displayed using placeholder characters:

| Placeholder | Behavior                                                   |
|-------------|------------------------------------------------------------|
| `'0'`       | Fixed digit: always shows a digit, even if it's `0`.       |
| `'#'`       | Flexible digit: shows a digit if present, or nothing.      |
| `'?'`       | Aligning digit: shows a digit if present, or a space.      |

```typescript
type TableDigitPlaceholder = {
    fixed?: number;  // Number of '0' placeholders
    flex?: number;   // Number of '#' placeholders
    align?: number;  // Number of '?' placeholders
};
```

**Example:**
```typescript
const placeholder: TableDigitPlaceholder = { fixed: 2, flex: 3 };
```
- Displays two mandatory digits and up to three additional digits if available.

---

##### **7.6.3 Numeric Formats**

There are three specific numeric formats, each extending the base numeric format:

1. **Number Format**

    ```typescript
    type TableNumberFormat = TableBaseNumericFormat<"number">;
    ```
    Displays numbers with optional integer/decimal placeholders and thousands separators.

2. **Percent Format**

    ```typescript
    type TablePercentFormat = TableBaseNumericFormat<"percent">;
    ```
    Displays percentages (e.g., `0.75` as `75%`).

3. **Currency Format**

    ```typescript
    type TableCurrencyFormat = TableBaseNumericFormat<"currency"> & {
        symbol?: string;                // The currency symbol, e.g. "$"
        position?: "prefix" | "suffix"; // Symbol placement, defaults to 'prefix'
    };
    ```
    Displays currency values like `$1234.56`, typically with two decimal places.

---

#### **7.7 Temporal Type** (`TableTemporalType`)

Represents date and time data, with flexible validation and customizable formatting.  

```typescript
type TableTemporalType = {
    kind: "temporal";
    style?: TableStyle | TableReference;                // Base style
    styles?: TableConditionalStyle<TableTemporalRule>[];// Conditional styling
    rule?: TableTemporalRule;                           // Validation rule
    format?: TableTemporalFormat | TableReference;      // Formatting
};
```

---

##### **7.7.1 Temporal Rules**

Temporal rules validate date and time values. They function similarly to numeric rules but operate on temporal strings (`YYYY-MM-DD`).

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

##### **7.7.2 TableTemporalUnit**

A `TableTemporalUnit` defines a single element of a temporal format, such as a year, month, day, or time component. Each unit can optionally specify a `length`, which determines whether the unit is displayed in a short or long format.

```typescript
type TableTemporalUnit = {
    type: "year"
         | "month"
         | "monthname"
         | "weekday"
         | "day"
         | "hour"
         | "minute"
         | "second"
         | "meridiem";
    length?: "short" | "long";
};
```

###### **Unit Type Details**

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

###### **Example Temporal Formats**

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

### **8. TableUnit and Hierarchical Structure**

The `TableUnit` type provides the foundation for defining a `TableBook`. This section covers each layer of the hierarchy—from the smallest element (**TableColumn**) to the root (**TableBook**)—and explains how **definitions** can be declared at each level to enable flexible, cascading reuse of styles, formats, and more.

---

#### **8.1 TableDefinitions**

A `TableUnit` can optionally declare `definitions` that store **reusable, named elements** such as colors, styles, themes, numeric/temporal formats, and column types. Each level (**column, group, page, book**) can define its own `definitions`, and references to these definitions cascade **upward** when a match isn't found locally.

Additionally, **definitions themselves can reference other definitions** using `TableReference`. This enables modular, hierarchical styling and formatting where:
- A **style** can reference a **color**.
- A **theme** can inherit from another **theme**.
- A **type** can reference a **format**.
- A **numeric format** can reference another numeric format.
- A **temporal format** can reference a pre-existing pattern.

This design allows for **cleaner, DRY (Don’t Repeat Yourself) configurations**, making it easy to create reusable building blocks.

---

##### **8.1.1 Definition**

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

##### **How TableReference Works**
Each category (`colors`, `styles`, `themes`, `numerics`, `temporals`, `types`) follows the same pattern:  
A **named object** can either:
- Define the element **inline** (e.g., `danger: { fore: "#FF0000" }`).
- **Reference another definition** using `@referenceName` (e.g., `alert: "@danger"`).

This enables:
1. **Thematic consistency** – A style can refer to predefined colors.
2. **Extensible formats** – A numeric format can extend another numeric format.
3. **Hierarchical styling** – A theme can inherit another theme’s properties.

---

##### **8.1.2 Example**

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

##### **8.1.3 Explanation of Example**
- **Color Reference (`@alert`)**: `"alert"` refers to `"danger"`, meaning `"alert"` will resolve to `#FF0000`.
- **Style Inheritance (`@alertHeader`)**: `"alertHeader"` references `"alert"` for its foreground color.
- **Theme Inheritance (`@corporate`)**: The `"corporate"` theme inherits from `"@blue"` and applies `"@boldHeader"` to headers.
- **Numeric Format Reference (`@usd`)**: `"usd"` simply references `"currency"`, ensuring consistency.
- **Temporal Format Reference (`@usFormat`)**: `"usFormat"` refers to `"shortDate"`, preventing duplication.
- **Column Type Reference (`@currencyColumn`)**: `"currencyColumn"` applies `"@usd"` as its format.

---

##### **8.1.4 Key Benefits**
- **Reusability**: Any definition can be **used multiple times** without repetition.
- **Consistency**: Ensures **standardized** styling, formatting, and data types across the `TableBook`.
- **Modular Structure**: Small, **composable** definitions allow for easier customization and scaling.
- **Cascading Resolution**: If `"@referenceName"` isn't found in a `TableUnit`, it will **search upward** (column → group → page → book).

---

#### **8.2 TableUnit**

All elements in a `TableBook` (columns, groups, pages, and the book itself) extend `TableUnit`. It holds common properties like a name, optional theme, an optional description, and the optional `definitions`.

##### **8.2.1 Definition**

```typescript
type TableUnit = {
  name: string;                        // Unique identifier.
  theme?: TableTheme | TableReference; // Optional theme for this unit.
  description?: string;                // Optional explanation/purpose.
  definitions?: TableDefinitions;      // Local definitions, cascading upward.
};
```

- **`name`** must follow `TableUnitNameRegex` (`^[A-Z][A-Za-z0-9_]+$`), starting with an uppercase letter.
- **`theme`** can be an inline `TableTheme` or a reference like `@myTheme`.
- **`definitions`** can override or add to any definitions from parent units.

---

#### **8.3 TableColumn**

A `TableColumn` represents the smallest unit in a `TableBook`. It extends `TableUnit` and includes properties for data typing and optional expressions.

##### **8.3.1 Definition**

```typescript
type TableColumn = TableUnit & {
  type: TableDataType | TableReference;      // The data type of the column.
  source?: string;                             // Optional metadata about the column's data source.
  expression?: TableExpression<TableSelector>; // Optional expression for computed values.
};
```

##### **8.3.2 Example**

```json
{
  "name": "Revenue",
  "type": "@currencyColumn",
  "definitions": {
    "types": {
      "currencyColumn": { "kind": "numeric", "format": "@currency" }
    }
  }
}
```

---

#### **8.4 TableGroup**

A `TableGroup` organizes multiple `TableColumn` elements into a logical set (e.g., financial columns vs. operational columns). Groups also extend `TableUnit`, so they can have their own definitions, theme, or description.

##### **8.4.1 Definition**

```typescript
type TableGroup = TableUnit & {
  columns: TableColumn[];
};
```

##### **8.4.2 Example**

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

#### **8.5 TablePage**

A `TablePage` represents a **single sheet** within a `TableBook`. Every page has **one table** made up of groups and columns.

##### **8.5.1 Definition**

```typescript
type TablePage = TableUnit & {
  groups: TableGroup[];
  rows: number;         // Number of Rows in the Table
};
```

##### **8.5.2 Example**

```json
{
  "name": "SummaryPage",
  "rows": 100,
  "groups": [
    {
      "name": "RevenueGroup",
      "columns": [
        { "name": "Revenue", "type": { "kind": "numeric" } }
      ]
    }
  ]
}
```

---

#### **8.6 TableBook**

A `TableBook` is the **root** container, holding an array of pages. It extends `TableUnit` so it can also specify **global** definitions, themes, or descriptions.

##### **8.6.1 Definition**

```typescript
type TableBook = TableUnit & {
  pages: TablePage[];
};
```

##### **8.6.2 Example**

```json
{
  "name": "AnnualReport",
  "definitions": {
    "colors": {
      "highlight": "#FFD700"
    },
    "themes": {
      "highlightTheme": {
        "inherits": ["@blue"],
        "tab": "@highlight"
      }
    }
  },
  "pages": [
    {
      "name": "SummaryPage",
      "theme": "@highlightTheme",
      "rows": 100,
      "groups": [
        {
          "name": "RevenueGroup",
          "columns": [
            { "name": "Revenue", "type": "@currencyColumn" }
          ]
        }
      ]
    }
  ]
}
```

---

#### **Key Takeaways**
1. **Local Definitions at Every Level**: Each `TableUnit` can define its own `definitions`, enabling flexible, localized overrides or additions.
2. **Upward Cascading**: If a referenced definition isn’t found locally, the search continues up the hierarchy.
3. **Consistent Column-Based Design**: Each page holds exactly one table, defined by groups and columns, with row count determined by the page’s `rows` property.
4. **Unified `TableUnit`**: Common properties (`name`, `theme`, `description`, `definitions`) ensure consistent behavior and the ability to override settings at any level.

---
---

### **9. Result**

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

---
---

### **10. TableBookIssue**

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

#### **10.1 TableBookParseIssue**
Represents issues encountered during the **parsing phase** (e.g., invalid JSON/YAML syntax).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'parsing'`          | Indicates the parsing phase.              |
| `message`     | `string`             | Descriptive message about the issue.      |
| `location`    | `TextLocation`       | Location (line/column) of the issue.      |
| `length`      | `number`             | Length of the problematic text segment.   |

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

#### **10.2 TableBookValidateIssue**
Represents issues encountered during the **validation phase** (e.g., schema violations).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'validating'`       | Indicates the validation phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `path`        | `ObjectPath`         | Path to the problematic data.             |
| `value`       | `any` (optional)     | The invalid value that caused the issue.  |

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

#### **10.3 TableBookProcessIssue**
Represents issues encountered during the **processing phase** (e.g., resolving references).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'processing'`       | Indicates the processing phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `path`        | `ObjectPath`         | Path to the problematic data.             |
| `data`        | `any`                | Contextual data about the issue.          |

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

#### **10.4 TableBookGenerateIssue**
Represents issues encountered during the **generation phase** (e.g., external generator errors).

##### **Properties**
| Field         | Type                 | Description                                |
|---------------|----------------------|--------------------------------------------|
| `type`        | `'generating'`       | Indicates the generation phase.           |
| `message`     | `string`             | Descriptive message about the issue.      |
| `data`        | `any`                | Contextual data about the issue.          |

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

### **11. TableBook Functions**

The `tablebook` object includes utilities for parsing, validating, processing, and generating `TableBook` objects. Here's a breakdown:

---

#### **11.1 tablebook.parse**

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

#### **11.2 tablebook.validate**

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

#### **11.3 tablebook.process**

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
    /** Excludes the StandardPaletteResolver if true. Default is false. */
    omitStandardPalette?: boolean;
    /** Logger for tracking processing progress. */
    logger?: TableProcessLogger;
};
```

##### **11.3.1 TableDefinitionResolver**

Handles missing references for colors, styles, themes, formats, and types during processing. 
Each resolver mirrors the structure of `TableDefinitions`
A Lookup can be a Record with prebuilt items or a `TableReferenceResolver` function.
A `TableReferenceResolver` function returns a `Result` - a string is a critical error (like partial parse) that will show as an issue, while undefined is a silent fail.
This enables support for prebuilt definitions (e.g., palettes) or custom type definitions like `@number:2` to represent a 2-decimal number—offering flexibility limited only by your imagination.

##### **Definition**
```typescript
/** A function that resolves a table reference by name */
export type TableReferenceResolver<T> = (name: string) => Result<T, string | undefined>;

/** A lookup for table references, either a map or a resolver function */
export type TableReferenceLookup<T> = Record<string, T> | TableReferenceResolver<T>;

/** Defines resolvers for various table definitions */
export type TableDefinitionResolver = {
    colors?: TableReferenceLookup<TableColor>;
    styles?: TableReferenceLookup<TableHeaderStyle>;
    themes?: TableReferenceLookup<TableTheme>;
    numerics?: TableReferenceLookup<TableNumericFormat>;
    temporals?: TableReferenceLookup<TableTemporalFormat>;
    types?: TableReferenceLookup<TableDataType>;
};
```

##### **Example Resolver**
```typescript
const resolvers: TableDefinitionResolver = {
    colors: (name, path) => {
        if (name === 'black')
          return Result.success('#000000'),
        else
          return Result.failure(undefined);
    },
    format: {
        numerics: () => Result.success({ type: 'number', integer: { fixed: 2 }, decimal: { fixed: 2 } })
    }
};
```

##### **11.3.2 TableProcessLogger**

Tracks processing progress at each level of the hierarchy.

##### **Definition**
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
const processResult = tablebook.process(tableBook, resolvers, logger);
if (processResult.success)
    console.log('Processed SheetBook:', processResult.value);
else
    console.error('Processing issues:', processResult.info);
```

---

#### **11.4 tablebook.generate**

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

#### **11.5 tablebook.generators**

The `generators` object provides methods to create output generators for converting a processed `SheetBook` into a spreadsheet. It simplifies the integration with external systems by abstracting the complexity of connecting to APIs or managing file formats.

---

#### **11.5.1 tablebook.generators.google**

Creates a Google Sheets generator for exporting to a specified sheet.

##### **Definition**
```typescript
tablebook.generators.google(
  email: string,        // Service account email for Google Sheets API.
  key: string,          // API key for authenticating the service account.
  sheetId: string,      // ID of the target Google Sheet.
  reset: boolean        // Whether to clear existing sheet content before writing.
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
