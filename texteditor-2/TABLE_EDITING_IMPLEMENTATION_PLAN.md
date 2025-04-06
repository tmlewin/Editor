# Table Editing Implementation Plan

This document outlines the step-by-step implementation plan for adding comprehensive table editing capabilities to TextEditor 2.0.

## Phase 1: Table Contextual Toolbar

### Step 1: Create TableToolbar Component
- Create a new file: `/src/components/editor/TableToolbar.tsx`
- Implement a basic toolbar with buttons for table operations
- Style the toolbar to match the editor's design system
- Add positioning logic to display near the active table

```tsx
// Basic structure of TableToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { 
  RowsIcon, 
  ColumnsIcon, 
  Trash2Icon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  MergeIcon,
  SplitIcon
} from "lucide-react";

interface TableToolbarProps {
  position: { top: number; left: number } | null;
  onAddRowAbove: () => void;
  onAddRowBelow: () => void;
  onAddColumnLeft: () => void;
  onAddColumnRight: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onDeleteTable: () => void;
  onMergeCells: () => void;
  onSplitCell: () => void;
}

export default function TableToolbar({
  position,
  onAddRowAbove,
  onAddRowBelow,
  onAddColumnLeft,
  onAddColumnRight,
  onDeleteRow,
  onDeleteColumn,
  onDeleteTable,
  onMergeCells,
  onSplitCell
}: TableToolbarProps) {
  if (!position) return null;
  
  return (
    <div 
      className="absolute z-50 bg-background border rounded shadow-md p-1 flex gap-1"
      style={{ top: position.top, left: position.left }}
    >
      <Button variant="ghost" size="icon" onClick={onAddRowAbove} title="Add row above">
        <ArrowUpIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddRowBelow} title="Add row below">
        <ArrowDownIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddColumnLeft} title="Add column left">
        <ArrowLeftIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onAddColumnRight} title="Add column right">
        <ArrowRightIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDeleteRow} title="Delete row">
        <RowsIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDeleteColumn} title="Delete column">
        <ColumnsIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onMergeCells} title="Merge cells">
        <MergeIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onSplitCell} title="Split cell">
        <SplitIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDeleteTable} title="Delete table">
        <Trash2Icon className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Step 2: Implement Table Detection Logic
- Add functions to detect when the cursor is inside a table
- Determine the current cell, row, and column
- Calculate the position for the toolbar display

```tsx
// Add to EditorContent.tsx
const [tableToolbarPosition, setTableToolbarPosition] = useState<{ top: number; left: number } | null>(null);
const [activeTableElement, setActiveTableElement] = useState<HTMLTableElement | null>(null);
const [activeCellElement, setActiveCellElement] = useState<HTMLTableCellElement | null>(null);

// Function to check if cursor is in a table and update toolbar position
const checkCursorInTable = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    setTableToolbarPosition(null);
    setActiveTableElement(null);
    setActiveCellElement(null);
    return;
  }

  const range = selection.getRangeAt(0);
  let node = range.commonAncestorContainer;
  
  // Find if we're inside a table cell
  let cellElement: HTMLTableCellElement | null = null;
  let tableElement: HTMLTableElement | null = null;
  
  // Traverse up to find table and cell
  while (node && node !== editorRef.current) {
    if (node.nodeName === 'TD' || node.nodeName === 'TH') {
      cellElement = node as HTMLTableCellElement;
    }
    if (node.nodeName === 'TABLE') {
      tableElement = node as HTMLTableElement;
      break;
    }
    node = node.parentNode as Node;
  }
  
  if (tableElement && cellElement) {
    // We're inside a table cell
    setActiveTableElement(tableElement);
    setActiveCellElement(cellElement);
    
    // Calculate position for toolbar (above the table)
    const tableRect = tableElement.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();
    
    if (editorRect) {
      setTableToolbarPosition({
        top: tableRect.top - editorRect.top - 40, // Position above the table
        left: tableRect.left - editorRect.left
      });
    }
  } else {
    // Not in a table
    setTableToolbarPosition(null);
    setActiveTableElement(null);
    setActiveCellElement(null);
  }
};

// Add event listeners to detect cursor position
useEffect(() => {
  const handleSelectionChange = () => {
    checkCursorInTable();
  };
  
  document.addEventListener('selectionchange', handleSelectionChange);
  return () => {
    document.removeEventListener('selectionchange', handleSelectionChange);
  };
}, []);
```

### Step 3: Implement Row Operations
- Add functions to insert rows above/below the current row
- Add function to delete the current row
- Connect these functions to the toolbar buttons

```tsx
// Add to EditorContent.tsx
const addRowAbove = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current row
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  // Create a new row with the same number of cells
  const newRow = document.createElement('tr');
  const cells = currentRow.cells;
  
  // Add cells to the new row
  for (let i = 0; i < cells.length; i++) {
    const newCell = document.createElement(cells[i].tagName);
    newCell.innerHTML = '<br>';
    newCell.style.border = '1px solid #ddd';
    newCell.style.padding = '8px';
    newRow.appendChild(newCell);
  }
  
  // Insert the new row before the current row
  currentRow.parentNode?.insertBefore(newRow, currentRow);
  
  // Update the editor content
  handleInput();
};

const addRowBelow = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current row
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  // Create a new row with the same number of cells
  const newRow = document.createElement('tr');
  const cells = currentRow.cells;
  
  // Add cells to the new row
  for (let i = 0; i < cells.length; i++) {
    const newCell = document.createElement(cells[i].tagName);
    newCell.innerHTML = '<br>';
    newCell.style.border = '1px solid #ddd';
    newCell.style.padding = '8px';
    newRow.appendChild(newCell);
  }
  
  // Insert the new row after the current row
  if (currentRow.nextSibling) {
    currentRow.parentNode?.insertBefore(newRow, currentRow.nextSibling);
  } else {
    currentRow.parentNode?.appendChild(newRow);
  }
  
  // Update the editor content
  handleInput();
};

const deleteRow = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current row
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  // Check if this is the last row in the table
  const tbody = currentRow.parentNode;
  if (tbody && tbody.childNodes.length <= 1) {
    // If it's the last row, delete the entire table
    deleteTable();
    return;
  }
  
  // Remove the row
  currentRow.parentNode?.removeChild(currentRow);
  
  // Update the editor content
  handleInput();
};
```

### Step 4: Implement Column Operations
- Add functions to insert columns to the left/right of the current column
- Add function to delete the current column
- Connect these functions to the toolbar buttons

```tsx
// Add to EditorContent.tsx
const addColumnLeft = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current column index
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  const columnIndex = Array.from(currentRow.cells).indexOf(activeCellElement);
  
  // Add a new cell to each row at this index
  const rows = activeTableElement.querySelectorAll('tr');
  rows.forEach(row => {
    const newCell = document.createElement(row.cells[columnIndex].tagName);
    newCell.innerHTML = '<br>';
    newCell.style.border = '1px solid #ddd';
    newCell.style.padding = '8px';
    
    if (row.cells[columnIndex]) {
      row.insertBefore(newCell, row.cells[columnIndex]);
    } else {
      row.appendChild(newCell);
    }
  });
  
  // Update the editor content
  handleInput();
};

const addColumnRight = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current column index
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  const columnIndex = Array.from(currentRow.cells).indexOf(activeCellElement);
  
  // Add a new cell to each row after this index
  const rows = activeTableElement.querySelectorAll('tr');
  rows.forEach(row => {
    const newCell = document.createElement(row.cells[columnIndex].tagName);
    newCell.innerHTML = '<br>';
    newCell.style.border = '1px solid #ddd';
    newCell.style.padding = '8px';
    
    if (row.cells[columnIndex + 1]) {
      row.insertBefore(newCell, row.cells[columnIndex + 1]);
    } else {
      row.appendChild(newCell);
    }
  });
  
  // Update the editor content
  handleInput();
};

const deleteColumn = () => {
  if (!activeTableElement || !activeCellElement) return;
  
  // Find the current column index
  const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
  if (!currentRow) return;
  
  const columnIndex = Array.from(currentRow.cells).indexOf(activeCellElement);
  
  // Check if this is the last column in the table
  if (currentRow.cells.length <= 1) {
    // If it's the last column, delete the entire table
    deleteTable();
    return;
  }
  
  // Remove this column from each row
  const rows = activeTableElement.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.cells[columnIndex]) {
      row.removeChild(row.cells[columnIndex]);
    }
  });
  
  // Update the editor content
  handleInput();
};

const deleteTable = () => {
  if (!activeTableElement) return;
  
  // Remove the table
  activeTableElement.parentNode?.removeChild(activeTableElement);
  
  // Reset table-related state
  setTableToolbarPosition(null);
  setActiveTableElement(null);
  setActiveCellElement(null);
  
  // Update the editor content
  handleInput();
};
```

### Step 5: Integrate TableToolbar into EditorContent
- Add the TableToolbar component to the EditorContent component
- Connect the table operation functions to the toolbar
- Test the toolbar functionality

```tsx
// Update EditorContent.tsx render function
return (
  <div className="relative h-full">
    {renderLineNumbers()}
    <div
      ref={editorRef}
      className={`border rounded p-4 h-full focus:outline-none overflow-auto ${showLineNumbers ? 'pl-12' : ''}`}
      contentEditable={true}
      onInput={handleInput}
      onPaste={handlePaste}
      onClick={handleEditorClick}
      suppressContentEditableWarning={true}
      // ... other props
    />
    
    {/* Add the TableToolbar */}
    <TableToolbar
      position={tableToolbarPosition}
      onAddRowAbove={addRowAbove}
      onAddRowBelow={addRowBelow}
      onAddColumnLeft={addColumnLeft}
      onAddColumnRight={addColumnRight}
      onDeleteRow={deleteRow}
      onDeleteColumn={deleteColumn}
      onDeleteTable={deleteTable}
      onMergeCells={mergeCells}
      onSplitCell={splitCell}
    />
  </div>
);
```

## Phase 2: Cell Merging and Splitting

### Step 1: Implement Cell Merging
- Add function to merge selected cells
- Handle content combination from merged cells
- Update table structure after merging

```tsx
// Add to EditorContent.tsx
const mergeCells = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !activeTableElement) return;
  
  // Get the range that contains the selection
  const range = selection.getRangeAt(0);
  
  // Find all selected cells
  const selectedCells = [];
  const cells = activeTableElement.querySelectorAll('td, th');
  
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (range.intersectsNode(cell)) {
      selectedCells.push(cell);
    }
  }
  
  // Need at least 2 cells to merge
  if (selectedCells.length < 2) {
    alert('Please select multiple cells to merge');
    return;
  }
  
  // Check if selected cells form a rectangle (are in consecutive rows/columns)
  // This is a simplified check - a more robust implementation would verify the cells form a proper rectangle
  const firstCell = selectedCells[0];
  const firstRow = firstCell.parentElement;
  let isRectangle = true;
  
  // For simplicity, we'll just proceed with the merge
  // A production implementation would need more validation
  
  // Calculate the colspan and rowspan
  const rows = new Set();
  const firstRowCells = selectedCells.filter(cell => cell.parentElement === firstRow);
  
  selectedCells.forEach(cell => {
    if (cell.parentElement) {
      rows.add(cell.parentElement);
    }
  });
  
  const colspan = firstRowCells.length;
  const rowspan = rows.size;
  
  // Combine content from all selected cells
  let combinedContent = '';
  selectedCells.forEach(cell => {
    combinedContent += cell.innerHTML + ' ';
  });
  
  // Set the first cell's attributes
  firstCell.setAttribute('colspan', colspan.toString());
  firstCell.setAttribute('rowspan', rowspan.toString());
  firstCell.innerHTML = combinedContent.trim();
  
  // Remove the other cells
  for (let i = 1; i < selectedCells.length; i++) {
    selectedCells[i].parentElement?.removeChild(selectedCells[i]);
  }
  
  // Update the editor content
  handleInput();
};
```

### Step 2: Implement Cell Splitting
- Add function to split merged cells
- Handle content distribution after splitting
- Update table structure after splitting

```tsx
// Add to EditorContent.tsx
const splitCell = () => {
  if (!activeCellElement) return;
  
  // Check if the cell has colspan or rowspan
  const colspan = parseInt(activeCellElement.getAttribute('colspan') || '1');
  const rowspan = parseInt(activeCellElement.getAttribute('rowspan') || '1');
  
  if (colspan === 1 && rowspan === 1) {
    alert('This cell cannot be split further');
    return;
  }
  
  // Get the content of the cell
  const content = activeCellElement.innerHTML;
  
  // Remove colspan and rowspan attributes
  activeCellElement.removeAttribute('colspan');
  activeCellElement.removeAttribute('rowspan');
  
  // For simplicity, we'll just reset to a single cell
  // A production implementation would recreate the proper grid structure
  
  // Update the editor content
  handleInput();
};
```

## Next Steps

After implementing the table toolbar and basic cell operations, we'll proceed with:

1. **Table Context Menu** - Right-click menu for table operations
2. **Table Properties Dialog** - Dialog for adjusting table and cell properties
3. **Table Navigation Enhancements** - Improved keyboard navigation and selection

Each of these features will be implemented following a similar step-by-step approach.