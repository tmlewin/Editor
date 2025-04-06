"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getParentBlockElement, applySyntaxHighlighting, removeSyntaxHighlighting, fixLinks } from "@/utils/editorUtils";
import EditorContent from "./EditorContent";
import EditorPreview from "./EditorPreview";
import EditorToolbar from "./EditorToolbar";
import EditorHeader from "./EditorHeader";
import EditorFooter from "./EditorFooter";
import SettingsDialog from "../dialogs/SettingsDialog";
import ImageDialog from "../dialogs/ImageDialog";
import TableDialog from "../dialogs/TableDialog";
import { Document } from "@/types/document";

interface EditorProps {
  content: string;
  setContent: (content: string) => void;
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  documentsVisible: boolean;
  setDocumentsVisible: (visible: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  saveDocument: () => void;
  syncWithFirestore: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  autoSave: boolean;
  setAutoSave: (autoSave: boolean) => void;
  autoSaveInterval: number;
  setAutoSaveInterval: (interval: number) => void;
  exportAsPDF: () => void;
  exportAsMarkdown: () => void;
  exportAsHTML: () => void;
  currentDocument: Document | null;
}

export default function Editor({
  content,
  setContent,
  documentTitle,
  setDocumentTitle,
  documentsVisible,
  setDocumentsVisible,
  theme,
  setTheme,
  isFullScreen,
  toggleFullScreen,
  saveDocument,
  syncWithFirestore,
  syncStatus,
  autoSave,
  setAutoSave,
  autoSaveInterval,
  setAutoSaveInterval,
  exportAsPDF,
  exportAsMarkdown,
  exportAsHTML,
  currentDocument,
}: EditorProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(false);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageWidth, setImageWidth] = useState(300);
  const [imageHeight, setImageHeight] = useState(200);
  const [imageAlt, setImageAlt] = useState("");
  const [imageAlignment, setImageAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const originalFormattedContentRef = useRef<string>("");

  // Improved editor update for syntax highlighting with better selection preservation
  const handleEditorUpdate = () => {
    if (editorRef.current && enableSyntaxHighlighting) {
      // Save selection state
      const selection = window.getSelection();
      let selectionStart = 0;
      let selectionEnd = 0;

      // Get selection positions relative to the editor
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(editorRef.current);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        selectionStart = preSelectionRange.toString().length;
        selectionEnd = selectionStart + range.toString().length;
      }

      // Store the original formatted content before applying syntax highlighting
      // Only update if we don't already have it stored
      if (originalFormattedContentRef.current === "") {
        originalFormattedContentRef.current = editorRef.current.innerHTML;
      }

      // Get the current content
      const rawContent = editorRef.current.innerText;

      // Apply syntax highlighting using the imported function
      const highlightedContent = applySyntaxHighlighting(rawContent);

      // Only update if content has changed
      if (editorRef.current.innerHTML !== highlightedContent) {
        // Update the content
        editorRef.current.innerHTML = highlightedContent;

        // Restore selection using character positions
        if (selection && selectionStart !== selectionEnd) {
          // This is a more robust way to restore selection after HTML changes
          const charIndex = (node: Node, index: number): {node: Node, offset: number} => {
            let currentIndex = 0;

            if (node.nodeType === Node.TEXT_NODE) {
              if (index <= node.textContent!.length) {
                return {node, offset: index};
              } else {
                currentIndex = node.textContent!.length;
              }
            } else {
              for (let i = 0; i < node.childNodes.length; i++) {
                const childNode = node.childNodes[i];
                const result = charIndex(childNode, index - currentIndex);

                if (result) {
                  return result;
                }

                if (childNode.textContent) {
                  currentIndex += childNode.textContent.length;
                }

                if (currentIndex >= index) {
                  return {node: childNode, offset: childNode.textContent!.length};
                }
              }
            }

            return {node, offset: 0};
          };

          try {
            // Try to restore the selection
            const startPos = charIndex(editorRef.current, selectionStart);
            const endPos = charIndex(editorRef.current, selectionEnd);

            const newRange = document.createRange();
            newRange.setStart(startPos.node, startPos.offset);
            newRange.setEnd(endPos.node, endPos.offset);

            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch (e) {
            // If restoring selection fails, place cursor at the end
            try {
              const range = document.createRange();
              if (editorRef.current.lastChild) {
                range.setStartAfter(editorRef.current.lastChild);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            } catch (e) {
              // Last resort: just focus the editor
              editorRef.current.focus();
            }
          }
        }
      }
    }
  };

  // Enhanced effect for syntax highlighting toggle that works with tab switching
  useEffect(() => {
    if (editorRef.current) {
      if (enableSyntaxHighlighting) {
        // Store the current formatted content before applying syntax highlighting
        // Only store if we don't already have original content saved
        if (!originalFormattedContentRef.current) {
          // First remove any existing syntax highlighting
          const cleanedContent = removeSyntaxHighlighting(editorRef.current.innerHTML);
          originalFormattedContentRef.current = cleanedContent;
        }
        handleEditorUpdate();
      } else {
        // Preserve selection when restoring content
        const selection = window.getSelection();
        let selectionStart = 0;
        let selectionEnd = 0;

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const preSelectionRange = range.cloneRange();
          preSelectionRange.selectNodeContents(editorRef.current);
          preSelectionRange.setEnd(range.startContainer, range.startOffset);
          selectionStart = preSelectionRange.toString().length;
          selectionEnd = selectionStart + range.toString().length;
        }

        // Restore original formatted content without highlighting
        if (originalFormattedContentRef.current) {
          // Restore the original content
          editorRef.current.innerHTML = originalFormattedContentRef.current;
        } else {
          // If we don't have original content stored, remove syntax highlighting from current content
          const cleanedContent = removeSyntaxHighlighting(editorRef.current.innerHTML);
          editorRef.current.innerHTML = cleanedContent;
        }

        // Try to restore selection
        if (selection && selectionStart !== selectionEnd) {
          try {
            // Place cursor at approximately the same position
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
              const range = document.createRange();
              range.setStart(startNode, startOffset);
              range.setEnd(endNode, endOffset);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (e) {
            // If restoring selection fails, just focus the editor
            editorRef.current.focus();
          }
        }

        // Reset the original content reference
        originalFormattedContentRef.current = "";
      }

      // Update the content state to match what's in the editor
      setContent(editorRef.current.innerHTML);
    }
  }, [enableSyntaxHighlighting]);

  // Handle table insertion
  const handleInsertTable = (rows: number, cols: number, headerRow: boolean, headerCol: boolean) => {
    if (editorRef.current) {
      // Make sure the editor has focus
      editorRef.current.focus();

      // Restore the saved selection first
      restoreSavedSelection();

      // Create table HTML
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 1rem 0;">\n';

      // Add header row if requested
      if (headerRow) {
        tableHTML += '  <thead>\n    <tr>\n';
        for (let j = 0; j < cols; j++) {
          tableHTML += `      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${headerCol && j === 0 ? '' : `Header ${j+1}`}</th>\n`;
        }
        tableHTML += '    </tr>\n  </thead>\n';
      }

      // Add table body
      tableHTML += '  <tbody>\n';
      const startRow = headerRow ? 1 : 0;
      for (let i = startRow; i < rows; i++) {
        tableHTML += '    <tr>\n';
        for (let j = 0; j < cols; j++) {
          // If first column should be a header
          if (headerCol && j === 0) {
            tableHTML += `      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Row ${i+1}</th>\n`;
          } else {
            tableHTML += '      <td style="border: 1px solid #ddd; padding: 8px;"></td>\n';
          }
        }
        tableHTML += '    </tr>\n';
      }
      tableHTML += '  </tbody>\n</table><p></p>'; // Add a paragraph after the table for better cursor positioning

      // Get the current selection
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0;

      // If no selection exists, place cursor at the end of the content
      if (!hasSelection) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // Collapse to the end
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // Insert the table at the current selection
      document.execCommand('insertHTML', false, tableHTML);

      // Place cursor after the table
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.collapse(false); // Collapse to the end
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Force a content update
      const updatedContent = editorRef.current.innerHTML;
      setContent(updatedContent);

      // Ensure the editor is visible and scrolled to the insertion point
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          // Try to scroll to the newly inserted table
          const tables = editorRef.current.querySelectorAll('table');
          if (tables.length > 0) {
            const lastTable = tables[tables.length - 1];
            lastTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);

      // Clear the saved selection after use
      savedSelectionRef.current = null;
    }
  };

  // Store the selection range when opening dialogs
  const savedSelectionRef = useRef<Range | null>(null);

  // Function to save the current selection
  const saveCurrentSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedSelectionRef.current = null;
    }
  };

  // Function to restore the saved selection
  const restoreSavedSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedSelectionRef.current);
          editorRef.current.focus();
        } catch (e) {
          console.error("Error restoring selection:", e);
          // Fallback: focus the editor
          editorRef.current.focus();
        }
      }
    }
  };

  // Fixed handleFormat function to ensure formatting is properly applied
  const handleFormat = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      // Special handling for table insertion
      if (command === 'insertTable') {
        // Save the current selection before opening the dialog
        saveCurrentSelection();
        setTableDialogOpen(true);
        return;
      }

      // Make sure the editor has focus
      editorRef.current.focus();

      // Save the current selection
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0;

      // Ensure we have a valid selection before proceeding
      if (!hasSelection && command !== 'insertImage' && command !== 'createLink' && command !== 'insertHorizontalRule') {
        // For commands that require a selection, try to select all content if no selection exists
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      // Improved toggle for superscript/subscript
      if (command === 'superscript' || command === 'subscript') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.parentElement;

          // Check if the selected text is already formatted with the command
          const isAlreadyFormatted =
            (command === 'superscript' && parentElement?.tagName === 'SUP') ||
            (command === 'subscript' && parentElement?.tagName === 'SUB');

          if (isAlreadyFormatted) {
            // If already formatted, remove the formatting
            document.execCommand('removeFormat', false);
          } else {
            // Apply the formatting if not already applied
            document.execCommand(command, false);
          }
        } else {
          // Fallback if no selection
          document.execCommand(command, false);
        }
      }
      // Special handling for highlight
      else if (command === 'backColor') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentElement = range.commonAncestorContainer.parentElement;
          const currentBgColor = parentElement?.style.backgroundColor;

          if (currentBgColor === value) {
            // Remove the highlighting
            document.execCommand('removeFormat', false);
          } else {
            // Apply the highlighting
            document.execCommand(command, false, value);
          }
        } else {
          // Fallback if no selection
          document.execCommand(command, false, value);
        }
      }
      // Special handling for list operations
      else if (command === "insertUnorderedList" || command === "insertOrderedList") {
        // First ensure we're in a block element
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentBlock = getParentBlockElement(range.commonAncestorContainer);

          // If not in a block element, wrap in paragraph first
          if (!parentBlock) {
            document.execCommand('formatBlock', false, '<p>');
          }
        }

        // Now apply the list formatting
        document.execCommand(command, false, value);
      }
      // Special handling for heading formatting (H1-H6) and blockquotes
      else if (command === "formatBlock") {
        // Make sure the value is properly formatted for the execCommand
        const formattedValue = value ? `<${value}>` : undefined;

        // Check if there's a selection
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          // Get the current block element
          const range = selection.getRangeAt(0);
          const parentBlock = getParentBlockElement(range.commonAncestorContainer);

          // If the text is already formatted with the same block type, remove it
          if (parentBlock && parentBlock.tagName.toLowerCase() === value?.toLowerCase()) {
            // Remove the formatting by converting to a paragraph
            document.execCommand('formatBlock', false, '<p>');
          } else {
            // Apply the formatting
            document.execCommand(command, false, formattedValue);

            // Add special styling for blockquotes
            if (value === 'blockquote') {
              // Find all blockquotes in the editor and style them
              const blockquotes = editorRef.current.querySelectorAll('blockquote');
              blockquotes.forEach(blockquote => {
                if (!blockquote.style.borderLeft) {
                  blockquote.style.borderLeft = '4px solid #e5e7eb';
                  blockquote.style.paddingLeft = '1rem';
                  blockquote.style.marginLeft = '0';
                  blockquote.style.fontStyle = 'italic';
                  blockquote.style.color = 'inherit';
                }
              });
            }
          }
        } else {
          // No selection, just apply the formatting
          document.execCommand(command, false, formattedValue);

          // Add special styling for blockquotes
          if (value === 'blockquote') {
            const blockquotes = editorRef.current.querySelectorAll('blockquote');
            blockquotes.forEach(blockquote => {
              if (!blockquote.style.borderLeft) {
                blockquote.style.borderLeft = '4px solid #e5e7eb';
                blockquote.style.paddingLeft = '1rem';
                blockquote.style.marginLeft = '0';
                blockquote.style.fontStyle = 'italic';
                blockquote.style.color = 'inherit';
              }
            });
          }
        }
      }
      // Special handling for font size
      else if (command === "fontSize") {
        // Make sure we have a valid value
        if (value) {
          document.execCommand(command, false, value);
        }
      }
      // Special handling for font family
      else if (command === "fontName") {
        // Make sure we have a valid value
        if (value) {
          document.execCommand(command, false, value);
        }
      }
      // Special handling for alignment commands
      else if (command.startsWith("justify")) {
        // Ensure we're in a block element before applying alignment
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const parentBlock = getParentBlockElement(range.commonAncestorContainer);

          // If not in a block element, wrap in paragraph first
          if (!parentBlock) {
            document.execCommand('formatBlock', false, '<p>');
          }
        }

        // Now apply the alignment
        document.execCommand(command, false, value);
      }
      // Special handling for links
      else if (command === "createLink") {
        // Make sure we have a valid URL with a protocol
        if (value) {
          // Ensure URL has a protocol
          let formattedUrl = value.trim();
          if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#')) {
            formattedUrl = "https://" + formattedUrl;
          }

          // Create the link
          document.execCommand(command, false, formattedUrl);

          // Find the newly created link and add target="_blank" to open in a new tab
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer.parentElement;

            if (parentElement && parentElement.tagName === 'A') {
              parentElement.setAttribute('target', '_blank');
              parentElement.setAttribute('rel', 'noopener noreferrer');
            }
          }
        }
      }
      // Standard formatting for other commands
      else {
        document.execCommand(command, false, value);
      }

      // Update content and handle syntax highlighting if enabled
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);

        // If syntax highlighting is not enabled, update the original formatted content
        if (!enableSyntaxHighlighting) {
          originalFormattedContentRef.current = newContent;
        } else {
          handleEditorUpdate();
        }
      }
    }
  };

  // Enhanced handleTabChange function to properly handle syntax highlighting when switching tabs
  const handleTabChange = (value: string) => {
    // When leaving the edit tab, save content to state
    if (value === "preview" && editorRef.current) {
      // Save the current content before switching to preview
      const currentContent = editorRef.current.innerHTML;
      setContent(currentContent);

      // If syntax highlighting is enabled, make sure we have the original content stored
      if (enableSyntaxHighlighting && !originalFormattedContentRef.current) {
        // We need to store the original content without syntax highlighting
        // This is a bit tricky since we already have highlighting applied
        // Let's try to extract just the text content and wrap it in the same HTML structure

        // First, save the current HTML structure by replacing text content with placeholders
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentContent;

        // Function to process nodes and replace text with placeholders
        const processNode = (node: Node, textReplacements: {[key: string]: string}) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent) {
            const placeholder = `__TEXT_${Object.keys(textReplacements).length}__`;
            textReplacements[placeholder] = node.textContent;
            node.textContent = placeholder;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Skip syntax highlighting spans
            if ((node as Element).classList.contains('syntax-tag') ||
                (node as Element).classList.contains('syntax-keyword') ||
                (node as Element).classList.contains('syntax-string') ||
                (node as Element).classList.contains('syntax-number') ||
                (node as Element).classList.contains('syntax-comment') ||
                (node as Element).classList.contains('syntax-function') ||
                (node as Element).classList.contains('syntax-decorator') ||
                (node as Element).classList.contains('syntax-attr')) {
              // For syntax highlighting spans, just keep the text content
              if (node.textContent) {
                const placeholder = `__TEXT_${Object.keys(textReplacements).length}__`;
                textReplacements[placeholder] = node.textContent;
                (node as Element).textContent = placeholder;
              }
            } else {
              // For other elements, process their children
              for (let i = 0; i < node.childNodes.length; i++) {
                processNode(node.childNodes[i], textReplacements);
              }
            }
          }
        };

        // Process the DOM and collect text replacements
        const textReplacements: {[key: string]: string} = {};
        for (let i = 0; i < tempDiv.childNodes.length; i++) {
          processNode(tempDiv.childNodes[i], textReplacements);
        }

        // Get the structure with placeholders
        const structureWithPlaceholders = tempDiv.innerHTML;

        // Now restore the text content
        let originalContent = structureWithPlaceholders;
        Object.keys(textReplacements).forEach(placeholder => {
          originalContent = originalContent.replace(placeholder, textReplacements[placeholder]);
        });

        // Store this as our original content
        originalFormattedContentRef.current = originalContent;
      }
    }

    // When switching back to edit tab, we'll populate content in a setTimeout
    // to ensure the DOM is ready
    if (value === "edit") {
      setTimeout(() => {
        if (editorRef.current) {
          // If syntax highlighting is disabled but we have original content stored,
          // use that instead of the potentially highlighted content
          if (!enableSyntaxHighlighting && originalFormattedContentRef.current) {
            editorRef.current.innerHTML = originalFormattedContentRef.current;
            // Reset the original content reference since we've used it
            originalFormattedContentRef.current = "";
          } else if (!enableSyntaxHighlighting) {
            // If syntax highlighting is disabled but we don't have original content,
            // remove any syntax highlighting from the current content
            const cleanedContent = removeSyntaxHighlighting(content);
            editorRef.current.innerHTML = cleanedContent;
          } else {
            // Otherwise, use the current content
            editorRef.current.innerHTML = content;

            // If syntax highlighting is enabled, apply it
            if (enableSyntaxHighlighting) {
              handleEditorUpdate();
            }
          }

          // Ensure the editor has focus
          editorRef.current.focus();

          // Place cursor at the end of the content
          const range = document.createRange();
          const selection = window.getSelection();

          if (editorRef.current.childNodes.length > 0) {
            const lastChild = editorRef.current.lastChild;
            if (lastChild) {
              range.setStartAfter(lastChild);
              range.collapse(true);
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          }
        }
      }, 10); // Slightly longer timeout to ensure DOM is ready
    }
  };

  // Handle image insertion
  const handleImageInsertion = () => {
    // Save the current selection before opening the dialog
    saveCurrentSelection();

    // Reset form values
    setImageUrl("");
    setImageFile(null);
    setImageWidth(300);
    setImageHeight(200);
    setImageAlt("");
    setImageAlignment('center');

    // Open the dialog
    setImageDialogOpen(true);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      setImageFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);

          // Get image dimensions
          const img = new window.Image();
          img.onload = () => {
            // Set dimensions while maintaining aspect ratio
            const aspectRatio = img.width / img.height;
            setImageWidth(300);
            setImageHeight(Math.round(300 / aspectRatio));
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert image into editor with improved cursor positioning
  const insertImage = () => {
    if (editorRef.current) {
      // Make sure the editor has focus
      editorRef.current.focus();

      // Restore the saved selection first
      restoreSavedSelection();

      // Create image HTML with proper alignment
      // Using a more cursor-friendly approach that allows positioning cursor to the right of images
      let imageHtml;

      if (imageAlignment === 'center') {
        // For center alignment, use a div with text-align: center
        imageHtml = `<div style="text-align: center; margin: 10px 0; clear: both;">
          <img src="${imageUrl}" alt="${imageAlt}" width="${imageWidth}" height="${imageHeight}" style="max-width: 100%;" contenteditable="false" />
        </div><p></p>`; // Add paragraph after for better cursor positioning
      } else if (imageAlignment === 'right') {
        // For right alignment, use display: inline with float: right
        imageHtml = `<img src="${imageUrl}" alt="${imageAlt}" width="${imageWidth}" height="${imageHeight}"
          style="float: right; margin: 10px 0 10px 10px; max-width: 100%;" contenteditable="false" />`;
      } else {
        // For left alignment, use display: inline with float: left
        imageHtml = `<img src="${imageUrl}" alt="${imageAlt}" width="${imageWidth}" height="${imageHeight}"
          style="float: left; margin: 10px 10px 10px 0; max-width: 100%;" contenteditable="false" />`;
      }

      // Insert the image at cursor position
      document.execCommand('insertHTML', false, imageHtml);

      // Place cursor after the image
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.collapse(false); // Collapse to the end
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Update content
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }

      // Close the dialog first
      setImageDialogOpen(false);

      // Clear the saved selection after use
      savedSelectionRef.current = null;
    }
  };

  // The applySyntaxHighlighting function is now imported from editorUtils

  return (
    <div className="flex flex-col flex-1">
      <EditorHeader
        documentTitle={documentTitle}
        setDocumentTitle={setDocumentTitle}
        documentsVisible={documentsVisible}
        setDocumentsVisible={setDocumentsVisible}
        theme={theme}
        setTheme={setTheme}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        saveDocument={saveDocument}
        syncWithFirestore={syncWithFirestore}
        syncStatus={syncStatus}
        exportAsPDF={exportAsPDF}
        exportAsMarkdown={exportAsMarkdown}
        exportAsHTML={exportAsHTML}
        setSettingsOpen={setSettingsOpen}
      />

      <EditorToolbar
        handleFormat={handleFormat}
        showLineNumbers={showLineNumbers}
        setShowLineNumbers={setShowLineNumbers}
        enableSyntaxHighlighting={enableSyntaxHighlighting}
        setEnableSyntaxHighlighting={setEnableSyntaxHighlighting}
        textColor={textColor}
        setTextColor={setTextColor}
        bgColor={bgColor}
        setBgColor={setBgColor}
        handleImageInsertion={handleImageInsertion}
      />

      <Tabs
        defaultValue="edit"
        className="flex-1 flex flex-col"
        onValueChange={handleTabChange}
      >
        <TabsList className="mx-3 mt-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit" className="flex-1 p-4">
          <EditorContent
            content={content}
            setContent={setContent}
            showLineNumbers={showLineNumbers}
            enableSyntaxHighlighting={enableSyntaxHighlighting}
            originalFormattedContentRef={originalFormattedContentRef}
            handleEditorUpdate={handleEditorUpdate}
            editorRef={editorRef}
          />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 p-4">
          <EditorPreview
            content={content}
            enableSyntaxHighlighting={enableSyntaxHighlighting}
          />
        </TabsContent>
      </Tabs>

      <EditorFooter
        content={content}
        autoSave={autoSave}
        syncStatus={syncStatus}
      />

      <SettingsDialog
        open={settingsOpen}
        setOpen={setSettingsOpen}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        autoSaveInterval={autoSaveInterval}
        setAutoSaveInterval={setAutoSaveInterval}
      />

      <ImageDialog
        open={imageDialogOpen}
        setOpen={setImageDialogOpen}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        imageFile={imageFile}
        setImageFile={setImageFile}
        imageWidth={imageWidth}
        setImageWidth={setImageWidth}
        imageHeight={imageHeight}
        setImageHeight={setImageHeight}
        imageAlt={imageAlt}
        setImageAlt={setImageAlt}
        imageAlignment={imageAlignment}
        setImageAlignment={setImageAlignment}
        insertImage={insertImage}
        handleImageUpload={handleImageUpload}
      />

      <TableDialog
        open={tableDialogOpen}
        setOpen={setTableDialogOpen}
        onInsertTable={handleInsertTable}
      />
    </div>
  );
}