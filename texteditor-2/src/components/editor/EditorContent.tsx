"use client";

import { useRef, useEffect, useState } from "react";
import { applySyntaxHighlighting, cleanPastedContent, fixLinks, fixImages } from "@/utils/editorUtils";
import TableToolbar from "./TableToolbar";

interface EditorContentProps {
  content: string;
  setContent: (content: string) => void;
  showLineNumbers: boolean;
  enableSyntaxHighlighting: boolean;
  originalFormattedContentRef: React.MutableRefObject<string>;
  handleEditorUpdate: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

export default function EditorContent({
  content,
  setContent,
  showLineNumbers,
  enableSyntaxHighlighting,
  originalFormattedContentRef,
  handleEditorUpdate,
  editorRef,
}: EditorContentProps) {
  // Table editing state
  const [tableToolbarPosition, setTableToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [activeTableElement, setActiveTableElement] = useState<HTMLTableElement | null>(null);
  const [activeCellElement, setActiveCellElement] = useState<HTMLTableCellElement | null>(null);

  // Fix tables to ensure they're properly editable
  const fixTables = (html: string): string => {
    // If there are no tables, return the original HTML
    if (!html.includes('<table')) return html;

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find all tables
    const tables = tempDiv.querySelectorAll('table');

    // Process each table
    tables.forEach(table => {
      // Ensure table has proper styling
      if (!table.style.borderCollapse) {
        table.style.borderCollapse = 'collapse';
        table.style.width = '100%';
        table.style.margin = '1rem 0';
      }

      // Ensure all cells have proper styling
      const cells = table.querySelectorAll('th, td');
      cells.forEach(cell => {
        if (!cell.style.border) {
          cell.style.border = '1px solid #ddd';
          cell.style.padding = '8px';
        }
      });

      // Ensure there's a paragraph after the table for better cursor positioning
      const nextElement = table.nextElementSibling;
      if (!nextElement || (nextElement.tagName !== 'P' && nextElement.tagName !== 'DIV')) {
        const paragraph = document.createElement('p');
        paragraph.innerHTML = '<br>';
        table.parentNode?.insertBefore(paragraph, table.nextSibling);
      }
    });

    return tempDiv.innerHTML;
  };

  // Handle input in the editor with improved syntax highlighting and selection preservation
  const handleInput = () => {
    if (editorRef.current) {
      // Save the current selection
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      // Get the current content and fix any images and tables to make them cursor-friendly
      let newContent = editorRef.current.innerHTML;

      // Fix any images in the content
      let fixedContent = fixImages(newContent);

      // Fix any tables in the content
      fixedContent = fixTables(fixedContent);

      // Only update if the content has changed
      if (fixedContent !== newContent) {
        // Save the selection position
        let selectionStart = 0;
        let selectionEnd = 0;

        if (selection && selection.rangeCount > 0) {
          const preSelectionRange = range?.cloneRange();
          if (preSelectionRange) {
            preSelectionRange.selectNodeContents(editorRef.current);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            selectionStart = preSelectionRange.toString().length;
            selectionEnd = selectionStart + range.toString().length;
          }
        }

        // Update the content with fixed elements
        editorRef.current.innerHTML = fixedContent;
        newContent = fixedContent;

        // Try to restore the selection
        if (selection && selectionStart !== selectionEnd) {
          try {
            // This is a simplified version - in a real implementation, you'd need
            // a more robust way to find the right position after DOM changes
            const textNodes = [];
            const walk = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );

            let node;
            while (node = walk.nextNode()) {
              textNodes.push(node);
            }

            let currentLength = 0;
            let startNode = null;
            let startOffset = 0;
            let endNode = null;
            let endOffset = 0;

            // Find the nodes and offsets for selection
            for (let i = 0; i < textNodes.length; i++) {
              const node = textNodes[i];
              const nodeLength = node.textContent?.length || 0;

              if (!startNode && currentLength + nodeLength >= selectionStart) {
                startNode = node;
                startOffset = selectionStart - currentLength;
              }

              if (!endNode && currentLength + nodeLength >= selectionEnd) {
                endNode = node;
                endOffset = selectionEnd - currentLength;
                break;
              }

              currentLength += nodeLength;
            }

            // Set the selection if we found appropriate nodes
            if (startNode && endNode) {
              const newRange = document.createRange();
              newRange.setStart(startNode, startOffset);
              newRange.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // If restoring selection fails, just focus the editor
            editorRef.current.focus();
          }
        }
      }

      setContent(newContent);

      // If syntax highlighting is not enabled, update the original formatted content
      if (!enableSyntaxHighlighting) {
        originalFormattedContentRef.current = newContent;
      }
      // Apply syntax highlighting if enabled, with debounce for better performance
      else {
        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
          handleEditorUpdate();

          // Restore selection after syntax highlighting
          if (range && selection) {
            try {
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              // If restoring the exact range fails, place cursor at the end
              const newRange = document.createRange();
              if (editorRef.current?.lastChild) {
                newRange.setStartAfter(editorRef.current.lastChild);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
          }
        });
      }
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get the clipboard data
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedData = cleanPastedContent(clipboardData);

    // Insert the cleaned content
    document.execCommand('insertHTML', false, pastedData);
  };

  // Update editor content when content prop changes
  useEffect(() => {
    if (editorRef.current) {
      // Fix any links in the content
      let fixedContent = fixLinks(content);

      // Also fix tables in the content
      fixedContent = fixTables(fixedContent);

      // Only update if the current content is different to avoid cursor position issues
      if (editorRef.current.innerHTML !== fixedContent) {
        editorRef.current.innerHTML = fixedContent;

        // If the content contains a table that was just added, focus the editor
        // and place cursor after the last table
        if (fixedContent.includes('<table') && !editorRef.current.innerHTML.includes('<table')) {
          editorRef.current.focus();

          // Find all tables
          const tables = editorRef.current.querySelectorAll('table');
          if (tables.length > 0) {
            // Get the last table
            const lastTable = tables[tables.length - 1];

            // Create a range and place cursor after the table
            const range = document.createRange();
            range.setStartAfter(lastTable);
            range.collapse(true);

            // Apply the selection
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);

              // Scroll to the table
              lastTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      }
    }
  }, [content]);

  // Generate line numbers for the editor
  const renderLineNumbers = () => {
    if (!showLineNumbers) return null;

    // Simple line counting approach that won't cause performance issues
    const content = editorRef.current ? editorRef.current.innerText || "" : "";
    const lines = content.split('\n').length || 1;

    return (
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-muted/50 text-muted-foreground text-right pr-2 select-none">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="leading-6 text-xs">{i + 1}</div>
        ))}
      </div>
    );
  };

  // Update line numbers when content changes
  useEffect(() => {
    if (editorRef.current && showLineNumbers) {
      // Force re-render of line numbers when content changes
      const content = editorRef.current.innerText || "";
      const lines = content.split('\n').length || 1;
      // Update the line numbers container
      const lineNumbersContainer = editorRef.current.previousElementSibling;
      if (lineNumbersContainer && lineNumbersContainer.children.length !== lines) {
        renderLineNumbers();
      }
    }
  }, [content, showLineNumbers]);

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

  // Table manipulation functions
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

  const addColumnLeft = () => {
    if (!activeTableElement || !activeCellElement) return;

    // Find the current column index
    const currentRow = activeCellElement.parentElement as HTMLTableRowElement;
    if (!currentRow) return;

    const columnIndex = Array.from(currentRow.cells).indexOf(activeCellElement);

    // Add a new cell to each row at this index
    const rows = activeTableElement.querySelectorAll('tr');
    rows.forEach(row => {
      const newCell = document.createElement(row.cells[columnIndex]?.tagName || 'td');
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
      const newCell = document.createElement(row.cells[columnIndex]?.tagName || 'td');
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

  // Handle click events on images and tables to improve cursor positioning
  const handleEditorClick = (e: React.MouseEvent) => {
    // Check if the click was on an image
    const target = e.target as HTMLElement;

    if (target.tagName === 'IMG') {
      // Get the click position relative to the image
      const img = target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // Determine if the click was on the left or right side of the image
      const isRightSide = clickX > rect.width / 2;

      // Create a range
      const range = document.createRange();

      if (isRightSide) {
        // If clicked on the right side, position cursor after the image
        range.setStartAfter(img);
      } else {
        // If clicked on the left side, position cursor before the image
        range.setStartBefore(img);
      }

      range.collapse(true);

      // Apply the selection
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Prevent default behavior
      e.preventDefault();
    }
    // Handle clicks on elements containing images (like divs)
    else if (target.querySelector('img')) {
      const img = target.querySelector('img');
      if (img) {
        // Get the click position relative to the container
        const rect = target.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        // Determine if the click was on the left or right side of the image
        const isRightSide = clickX > (imgRect.left - rect.left + imgRect.width / 2);

        // Create a range
        const range = document.createRange();

        if (isRightSide) {
          // If clicked on the right side, position cursor after the container
          range.setStartAfter(target);
        } else {
          // If clicked on the left side, position cursor before the container
          range.setStartBefore(target);
        }

        range.collapse(true);

        // Apply the selection
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // Prevent default behavior
        e.preventDefault();
      }
    }
    // Special handling for table clicks outside of cells
    else if (target.tagName === 'TABLE' ||
             target.closest('table') &&
             (target.tagName !== 'TD' && target.tagName !== 'TH')) {
      // Find the table element
      const table = target.tagName === 'TABLE' ? target : target.closest('table');

      if (table) {
        // Get the click position relative to the table
        const rect = table.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        // Create a range
        const range = document.createRange();

        if (clickY < rect.height / 2) {
          // If clicked on the top half, position cursor before the table
          range.setStartBefore(table);
        } else {
          // If clicked on the bottom half, position cursor after the table
          range.setStartAfter(table);
        }

        range.collapse(true);

        // Apply the selection
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // Prevent default behavior
        e.preventDefault();
      }
    }
  };

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
        onMouseUp={() => {
          // Ensure selection is maintained when clicking in the editor
          if (window.getSelection()?.rangeCount === 0) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current!);
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
          }

          // Check if cursor is in a table
          checkCursorInTable();
        }}
        onKeyDown={(e) => {
          // Handle backspace key to delete images
          if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const startContainer = range.startContainer;

              // Check if we're at the beginning of a node that follows an image
              if (range.startOffset === 0) {
                // Check for previous sibling
                if (startContainer.previousSibling) {
                  const prevSibling = startContainer.previousSibling;

                  // If the previous sibling is an image, remove it
                  if (prevSibling.nodeName === 'IMG') {
                    prevSibling.parentNode?.removeChild(prevSibling);
                    e.preventDefault();
                    handleInput();
                  }
                  // If the previous sibling contains an image, remove it
                  else if ((prevSibling.nodeName === 'SPAN' || prevSibling.nodeName === 'DIV') &&
                      (prevSibling as HTMLElement).querySelector('img')) {
                    prevSibling.parentNode?.removeChild(prevSibling);
                    e.preventDefault();
                    handleInput();
                  }
                }
                // Check for parent's previous sibling if we're at the first child
                else if (startContainer.parentNode && startContainer.parentNode.previousSibling) {
                  const parentPrevSibling = startContainer.parentNode.previousSibling;

                  // If the parent's previous sibling is an image, remove it
                  if (parentPrevSibling.nodeName === 'IMG') {
                    parentPrevSibling.parentNode?.removeChild(parentPrevSibling);
                    e.preventDefault();
                    handleInput();
                  }
                  // If the parent's previous sibling contains an image, remove it
                  else if ((parentPrevSibling.nodeName === 'SPAN' || parentPrevSibling.nodeName === 'DIV') &&
                      (parentPrevSibling as HTMLElement).querySelector('img')) {
                    parentPrevSibling.parentNode?.removeChild(parentPrevSibling);
                    e.preventDefault();
                    handleInput();
                  }
                }
              }
            }
          }
          // Handle Enter key to escape from blockquotes
          else if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);

              // Find if we're inside a blockquote
              let node = range.startContainer;
              let blockquote = null;

              // Traverse up to find blockquote parent
              while (node && node !== editorRef.current) {
                if (node.nodeName === 'BLOCKQUOTE') {
                  blockquote = node;
                  break;
                }
                node = node.parentNode as Node;
              }

              // If we're inside a blockquote
              if (blockquote) {
                // Check if cursor is at the end of the blockquote content
                const isAtEnd = range.startOffset === (range.startContainer.textContent || '').length;

                // If the cursor is at the end of a text node that's the last child of the blockquote
                // or if the cursor is after the last child of the blockquote
                const isLastTextNode = !range.startContainer.nextSibling &&
                                      range.startContainer.parentNode === blockquote;
                const isAfterLastChild = range.startContainer === blockquote &&
                                        range.startOffset === blockquote.childNodes.length;

                if ((isAtEnd && isLastTextNode) || isAfterLastChild) {
                  // Prevent default Enter behavior
                  e.preventDefault();

                  // Insert a paragraph after the blockquote
                  const newParagraph = document.createElement('p');
                  newParagraph.innerHTML = '<br>'; // Empty paragraph needs <br> to be visible

                  // Insert after the blockquote
                  if (blockquote.nextSibling) {
                    blockquote.parentNode?.insertBefore(newParagraph, blockquote.nextSibling);
                  } else {
                    blockquote.parentNode?.appendChild(newParagraph);
                  }

                  // Set cursor to the new paragraph
                  const newRange = document.createRange();
                  newRange.setStart(newParagraph, 0);
                  newRange.collapse(true);

                  selection.removeAllRanges();
                  selection.addRange(newRange);

                  // Update the editor content
                  handleInput();
                }
              }
            }
          }
        }}
      />

      {/* Table Toolbar */}
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
}