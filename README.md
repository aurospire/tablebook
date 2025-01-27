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

### **3. TableSelector**

The `TableSelector` type enables precise targeting of data within a table. Its primary focus is **column-based selection**: you specify a column and optionally refine the selection to all or a subset of rows.

### **Key Concepts**
1. **Column-Based Selection Only**: Unlike traditional spreadsheets, `TableBook` does not support cell-based or horizontal (multi-column) selection. All data selection is **column-centric**, targeting one column at a time.
2. **Page → Group → Column Paradigm**: Columns are identified within a hierarchy:
   - **Page**: Synonymous with a `Table`, representing a single table within the spreadsheet. Each `Page` in the `TableBook` corresponds to one logical table, forming the core unit of the "book of tables."
   - **Group**: A subgroup within a page that organizes related columns.
   - **Column**: The specific column within a group.

### **Definition**
```typescript
export type TableSelector = 
  | TableSelfSelector
  | {
      column: TableColumnSelector | TableSelfSelector;
      rows: TableRowSelector | TableSelfSelector;
  };
```

---

### **3.1 TableColumnSelector**
The `TableColumnSelector` identifies a column by its position in the **Page → Group → Column** hierarchy. 

#### **Hierarchy Explanation**
1. **Page**: The page containing the column. Defaults to the current page if omitted.
2. **Group**: The group containing the column. Defaults to the current group if omitted.
3. **Name**: The name of the column. This is the only required field.

#### **Properties**
| Field         | Type         | Description                                             |
|---------------|--------------|---------------------------------------------------------|
| `page`        | `string` (optional) | The page containing the column. Defaults to the current page. |
| `group`       | `string` (optional) | The group containing the column. Defaults to the current group. |
| `name`        | `string`     | The name of the column (required).                      |

#### **Examples**
1. Fully qualified column selector:
   ```typescript
   const columnSelector: TableColumnSelector = {
     page: "Sales",
     group: "Revenue",
     name: "Price"
   };
   ```
2. Current group and page (minimal form):
   ```typescript
   const columnSelector: TableColumnSelector = { name: "Sales" };
   ```

---

### **3.2 TableRowSelector**
The `TableRowSelector` targets rows within the selected column. You can choose:
- A **specific row** (`$n`).
- A **subset of rows** (`from` and `to`).
- **All rows** (`'all'`).
- The **current row** (`'self'`).

#### **Variants**
| Selector   | Description                             |
|------------|-----------------------------------------|
| `$n`       | Absolute row position (1-based index). |
| `+n`       | N rows forward from the current row.   |
| `-n`       | N rows backward from the current row.  |
| `'self'`   | Current row in scope.                  |
| `'all'`    | All rows in the column.                |

#### **Examples**
1. Specific row:
   ```typescript
   const rowSelector: TableRowSelector = "$3"; // Row 3
   ```
2. Range of rows:
   ```typescript
   const rowSelector: TableRowSelector = { from: "$1", to: "$10" }; // Rows 1 to 10, this is inclusive
   ```
3. All rows:
   ```typescript
   const rowSelector: TableRowSelector = "all";
   ```

---

### **3.3 Self-Referencing Selectors**
Special cases allow you to reference the **current context**:
- **Column (`'self'`)**: The current column.
- **Row (`'self'`)**: The current row.

#### **Examples**
1. Select the current element:
   ```typescript
   const selfSelector: TableSelector = "self";
   ```
2. Select all rows in the current column:
   ```typescript
   const selector: TableSelector = { column: "self", rows: "all" };
   ```

---

### **3.4 TableSelector in Action**
Combining all parts of the `TableSelector`:

#### **Example**
Selecting the first 10 rows from the `Sales` column within the `Revenue` group on the `Summary` page:
```typescript
const tableSelector: TableSelector = {
  column: { page: "Summary", group: "Revenue", name: "Sales" },
  rows: { from: "$1", to: "$10" }
};
```

#### **Example: All Rows in a Column**
```typescript
const tableSelector: TableSelector = {
  column: { group: "Revenue", name: "Sales" },
  rows: "all"
};
```

---

### **Key Takeaways**
- The `TableSelector` exclusively targets **columns** and operates within the **Page → Group → Column** hierarchy.
- Row selection is optional and can specify a single row, range, or all rows.

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