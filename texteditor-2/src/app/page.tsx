"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Moon,
  Sun,
  Save,
  FileText,
  Download,
  Type,
  Maximize,
  Minimize,
  Layout,
  Hash,
  Code,
  Tag,
  Search,
  Plus,
  Folder,
  Strikethrough,
  PaintBucket,
  Palette,
  Settings as SettingsIcon,
  Keyboard,
  Trash2,
  FileDown,
  FileText as FileTextIcon,
  FileCode,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DocumentService } from "@/services/documentService";
import { Document } from "@/types/document";
import { mockDocuments } from "@/data/mockDocuments";
import { TagsService } from "@/services/tagsService";
import DocumentSidebar from "@/components/sidebar/DocumentSidebar";

// First move the syntax highlighter function outside since it doesn't depend on component state
const applySyntaxHighlighting = (content: string) => {
  // Preserve any existing selection
  const selection = window.getSelection();
  const range = selection?.getRangeAt(0);

  // Escape HTML entities first
  let processedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting with more comprehensive rules
  processedContent = processedContent
    // HTML tags
    .replace(/&lt;(\/?[a-zA-Z0-9]+)(?:\s+[^&>]+)*&gt;/g, '<span class="syntax-tag">&lt;$1&gt;</span>')
    // JavaScript keywords
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|null|undefined|true|false)\b/g, '<span class="syntax-keyword">$1</span>')
    // Strings
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="syntax-string">$1</span>')
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="syntax-comment">$1</span>');

  return processedContent;
};

export default function Home() {
  const [content, setContent] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const [documentTitle, setDocumentTitle] = useState<string>("Untitled Document");
  const [mounted, setMounted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(false);
  const [documentsVisible, setDocumentsVisible] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30); // seconds
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Move these functions inside the component
  const handleEditorUpdate = () => {
    if (editorRef.current && enableSyntaxHighlighting) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      // Get the current content
      const rawContent = editorRef.current.innerText;

      // Apply syntax highlighting
      const highlightedContent = applySyntaxHighlighting(rawContent);

      // Only update if content has changed
      if (editorRef.current.innerHTML !== highlightedContent) {
        editorRef.current.innerHTML = highlightedContent;

        // Restore selection
        if (range && selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);

      // Apply syntax highlighting if enabled
      if (enableSyntaxHighlighting) {
        handleEditorUpdate();
      }
    }
  };

  // Add the effect for syntax highlighting toggle
  useEffect(() => {
    if (editorRef.current) {
      if (enableSyntaxHighlighting) {
        handleEditorUpdate();
      } else {
        // Restore original content without highlighting
        const plainContent = editorRef.current.innerText;
        editorRef.current.innerHTML = plainContent;
      }
    }
  }, [enableSyntaxHighlighting]);

  // Update the handleFormat function to better handle list commands
  const handleFormat = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      // First, ensure the editor has focus
      editorRef.current.focus();

      // Special handling for list operations
      if (command === "insertUnorderedList" || command === "insertOrderedList") {
        // Store selection
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);

        // Apply list formatting
        document.execCommand(command, false, value);

        // Restore selection if needed
        if (range && selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }

        // Update content state
        setContent(editorRef.current.innerHTML);

        // Force a re-render of the editor content
        const currentContent = editorRef.current.innerHTML;
        editorRef.current.innerHTML = currentContent;
      } else {
        // Standard formatting for other commands
        document.execCommand(command, false, value);
        setContent(editorRef.current.innerHTML);
      }
    }
  };

  // Save or update content
  const handleContentSave = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  // Ensure we only render theme-dependent UI after hydration
  useEffect(() => {
    setMounted(true);

    // Listen for fullscreen changes
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

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

  // Add a simple useEffect that only updates line numbers when content changes
  // but doesn't trigger an infinite loop
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
  }, [content, showLineNumbers]); // Add content and showLineNumbers as dependencies

  // Update the handleTabChange function to handle tab switching more explicitly
  const handleTabChange = (value: string) => {
    // When leaving the edit tab, save content to state
    if (value === "preview" && editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }

    // When switching back to edit tab, we'll populate content in a setTimeout
    // to ensure the DOM is ready
    if (value === "edit") {
      setTimeout(() => {
        if (editorRef.current && editorRef.current.innerHTML !== content) {
          editorRef.current.innerHTML = content;
        }
      }, 0);
    }
  };

  // Create a new document
  const createNewDocument = async () => {
    // Save any existing content before creating a new document
    if (currentDocument && content) {
      await saveDocument();
    }

    const newDocument: Document = {
      id: Date.now(),
      title: "Untitled Document",
      content: "<p>Start writing here...</p>",
      tags: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    setCurrentDocument(newDocument);
    setDocumentTitle(newDocument.title);
    setContent(newDocument.content);

    if (editorRef.current) {
      editorRef.current.innerHTML = newDocument.content;
    }

    // Immediately save the new document
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);

    try {
      await DocumentService.saveDocument(newDocument, updatedDocuments);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Error creating new document:", error);
      setSyncStatus('offline');
    }

    return newDocument;
  };

  // Load an existing document
  const loadDocument = async (doc: Document) => {
    // First, save any changes to the current document before switching
    if (currentDocument && content) {
      await saveDocument();
    }

    // Then switch to the new document
    setCurrentDocument(doc);
    setDocumentTitle(doc.title);
    setContent(doc.content);

    // Set editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
  };

  // Add this useEffect to sync content state with editorRef
  useEffect(() => {
    if (editorRef.current) {
      // Only update if the current content is different to avoid cursor position issues
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  // Load documents on initial render
  useEffect(() => {
    const loadInitialDocuments = async () => {
      setIsLoading(true);
      try {
        // Try to load documents from Firestore first, with fallback to localStorage
        const loadedDocuments = await DocumentService.loadDocuments();

        if (loadedDocuments && loadedDocuments.length > 0) {
          setDocuments(loadedDocuments);
          setSyncStatus('synced');
        } else {
          // If no documents found, use mock documents as initial data
          setDocuments(mockDocuments);
          // Save mock documents to both storages
          await DocumentService.saveDocuments(mockDocuments);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        // If loading from Firestore fails, try localStorage
        const localDocs = DocumentService.loadFromLocalStorage();
        if (localDocs) {
          setDocuments(localDocs);
          setSyncStatus('offline');
        } else {
          // If all else fails, use mock documents
          setDocuments(mockDocuments);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialDocuments();
  }, []);

  // Save the current document
  const saveDocument = async () => {
    if (!content) return;

    // Show auto-save indicator
    setSyncStatus('syncing');

    try {
      if (currentDocument) {
        // Update existing document
        const updatedDocument = {
          ...currentDocument,
          title: documentTitle,
          content: content,
          modifiedAt: new Date()
        };

        // Replace the existing document in the list
        const updatedDocuments = documents.map(doc =>
          doc.id === updatedDocument.id ? updatedDocument : doc
        );

        setDocuments(updatedDocuments);
        setCurrentDocument(updatedDocument);

        // Save to both local storage and Firestore
        await DocumentService.saveDocument(updatedDocument, updatedDocuments);
        console.log("Updated existing document:", updatedDocument.title);
        setSyncStatus('synced');
      } else {
        // Only create a new document if one doesn't exist yet
        const newDocument: Document = {
          id: Date.now(),
          title: documentTitle || "Untitled Document",
          content: content,
          tags: [],
          createdAt: new Date(),
          modifiedAt: new Date()
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);
        setCurrentDocument(newDocument);

        // Save to both local storage and Firestore
        await DocumentService.saveDocument(newDocument, updatedDocuments);
        console.log("Created new document:", newDocument.title);
        setSyncStatus('synced');
      }
    } catch (error) {
      console.error("Error saving document:", error);
      setSyncStatus('offline');
      // Even if Firestore save fails, we still have the document in local storage
    }
  };

  // Implement keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if ctrl or cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            handleFormat('bold');
            break;
          case 'i':
            e.preventDefault();
            handleFormat('italic');
            break;
          case 'u':
            e.preventDefault();
            handleFormat('underline');
            break;
          case 's':
            e.preventDefault();
            saveDocument();
            break;
          case 'l':
            e.preventDefault();
            handleFormat('insertUnorderedList');
            break;
          case 'o':
            e.preventDefault();
            handleFormat('insertOrderedList');
            break;
          default:
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      // Set up new timer
      autoSaveTimerRef.current = setInterval(() => {
        // Only save if we have content, and avoid creating new documents
        if (content) {
          console.log("Auto-save triggered for document: ",
            currentDocument?.title || "New document");

          // Always use the existing saveDocument function
          saveDocument();
        }
      }, autoSaveInterval * 1000);
    } else if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, content, currentDocument]);

  // Delete a document
  const handleDeleteDocument = async (doc: Document) => {
    try {
      setSyncStatus('syncing');
      const updatedDocuments = await DocumentService.deleteDocument(doc.id, documents);
      setDocuments(updatedDocuments);
      setDocumentToDelete(null);

      // If we're deleting the current document, clear the editor
      if (currentDocument && currentDocument.id === doc.id) {
        setCurrentDocument(null);
        setDocumentTitle("Untitled Document");
        setContent("");
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      }

      setSyncStatus('synced');
    } catch (error) {
      console.error("Error deleting document:", error);
      setSyncStatus('offline');

      // Even if Firestore delete fails, we still update the local state
      const updatedDocuments = documents.filter(d => d.id !== doc.id);
      setDocuments(updatedDocuments);
      setDocumentToDelete(null);
    }
  };

  // Add export functions
  const exportAsPDF = async () => {
    // Create loading state
    const prevContent = content;
    setContent("<p>Preparing PDF export...</p>");

    try {
      // We'll use the browser's built-in print-to-PDF capability
      // Create a new window with styled content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker settings.');
      }

      // Write a complete HTML document to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${documentTitle}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              margin: 40px;
              color: #000;
              background: #fff;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1em;
              margin-bottom: 0.5em;
            }
            p {
              margin-bottom: 1em;
            }
            ul, ol {
              margin-bottom: 1em;
              padding-left: 2em;
            }
            li {
              margin-bottom: 0.5em;
            }
            .document-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            .document-content {
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body {
                margin: 0;
                padding: 1cm;
              }
              .print-instructions {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-instructions" style="background: #f5f5f5; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; font-size: 14px;">
            <p><strong>Instructions:</strong> To save as PDF, use your browser's print function (Ctrl+P or Cmd+P) and select "Save as PDF" as the destination.</p>
          </div>
          <div class="document-content">
            <div class="document-title">${documentTitle}</div>
            ${prevContent}
          </div>
          <script>
            // Automatically open the print dialog after the content loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      // Close the document for writing
      printWindow.document.close();

      // Restore original content
      setContent(prevContent);

    } catch (error) {
      console.error('Error preparing document for PDF export:', error);
      setContent(prevContent);
      alert(`PDF export failed: ${error.message || 'Unknown error'}`);
    }
  };

  const exportAsMarkdown = async () => {
    try {
      // Dynamic import of turndown
      const TurndownService = (await import('turndown')).default;
      const turndown = new TurndownService();

      // Convert HTML to Markdown
      const markdown = turndown.turndown(content);

      // Create and download file
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Markdown:', error);
      alert(`Failed to export as Markdown: ${error.message || 'Unknown error'}`);
    }
  };

  const exportAsHTML = () => {
    // Create a formatted HTML document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${documentTitle}</title>
    <style>
      body { font-family: system-ui, -apple-system, sans-serif; }
      .content { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    </style>
</head>
<body>
    <div class="content">
      ${content}
    </div>
</body>
</html>`;

    // Create and download file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Sync documents with Firestore
  const syncWithFirestore = async () => {
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    try {
      // First save any current changes
      if (currentDocument && content) {
        await saveDocument();
      }

      // Then sync all documents
      const syncedDocuments = await DocumentService.syncWithFirestore(documents);
      setDocuments(syncedDocuments);
      setSyncStatus('synced');

      // If we have a current document, make sure it's updated with the synced version
      if (currentDocument) {
        const updatedCurrentDoc = syncedDocuments.find(doc => doc.id === currentDocument.id);
        if (updatedCurrentDoc) {
          setCurrentDocument(updatedCurrentDoc);
          setDocumentTitle(updatedCurrentDoc.title);
          setContent(updatedCurrentDoc.content);

          if (editorRef.current) {
            editorRef.current.innerHTML = updatedCurrentDoc.content;
          }
        }
      }
    } catch (error) {
      console.error("Error syncing with Firestore:", error);
      setSyncStatus('offline');
    }
  };

  // Update document tags
  const updateDocumentTags = async (documentId: number, oldTags: string[], newTags: string[]) => {
    setSyncStatus('syncing');
    try {
      // Find the document to update
      const docToUpdate = documents.find(doc => doc.id === documentId);
      if (!docToUpdate) {
        throw new Error(`Document with ID ${documentId} not found`);
      }

      // Update the document with new tags
      const updatedDoc = {
        ...docToUpdate,
        tags: newTags,
        modifiedAt: new Date()
      };

      // Update the document in the local state
      const updatedDocuments = documents.map(doc =>
        doc.id === documentId ? updatedDoc : doc
      );

      setDocuments(updatedDocuments);

      // If this is the current document, update it
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(updatedDoc);
      }

      // Update tags in Firestore
      await TagsService.updateDocumentTags(documentId, oldTags, newTags);

      // Save the updated document
      await DocumentService.saveDocument(updatedDoc, updatedDocuments);

      setSyncStatus('synced');
    } catch (error) {
      console.error("Error updating document tags:", error);
      setSyncStatus('offline');
    }
  };

  // Add this function to handle paste events
  const handlePaste = (e) => {
    // Prevent the default paste behavior
    e.preventDefault();

    // Get the clipboard data
    const clipboardData = e.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text/html') || clipboardData.getData('text');

    // If we have HTML content, clean it
    if (clipboardData.types.includes('text/html')) {
      // Create a temporary element to manipulate the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedData;

      // Remove specific styling that causes visibility issues
      const allElements = tempDiv.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Remove color-related styling
          el.style.removeProperty('color');
          el.style.removeProperty('background-color');

          // Remove color-related attributes
          el.removeAttribute('color');

          // Remove any classes that might affect color
          el.className = el.className
            .split(' ')
            .filter(cls => !cls.includes('text-') && !cls.includes('bg-') && !cls.includes('color'))
            .join(' ');
        }
      });

      // Get the cleaned HTML
      pastedData = tempDiv.innerHTML;
    }

    // Insert the cleaned content
    document.execCommand('insertHTML', false, pastedData);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Document Management Panel */}
      {documentsVisible && (
        <DocumentSidebar
          documents={documents}
          createNewDocument={createNewDocument}
          loadDocument={loadDocument}
          handleDeleteDocument={handleDeleteDocument}
          updateDocumentTags={updateDocumentTags}
          isLoading={isLoading}
        />
      )}

      <div className="flex flex-col flex-1">
        {/* Navigation Bar */}
        <header className="border-b p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDocumentsVisible(!documentsVisible)}
            >
              <Folder className="h-5 w-5" />
            </Button>
            <FileText className="h-6 w-6" />
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-lg font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Sync status indicator */}
            <Button
              variant="ghost"
              size="icon"
              onClick={syncWithFirestore}
              disabled={syncStatus === 'syncing'}
              className="relative"
              title={syncStatus === 'synced' ? 'Synced with cloud' :
                     syncStatus === 'syncing' ? 'Syncing...' : 'Offline - Click to sync'}
            >
              {syncStatus === 'synced' ? (
                <Cloud className="h-4 w-4 text-green-500" />
              ) : syncStatus === 'syncing' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CloudOff className="h-4 w-4 text-orange-500" />
              )}
            </Button>

            <Button variant="outline" size="icon" onClick={toggleFullScreen}>
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted ? (
                theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={saveDocument}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportAsPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsMarkdown}>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsHTML}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Export as HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="p-2 border-b flex flex-wrap gap-1 items-center">
          <Button variant="ghost" size="icon" onClick={() => handleFormat("bold")}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("italic")}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("underline")}>
            <Underline className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyLeft")}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyCenter")}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyRight")}>
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyFull")}>
            <AlignJustify className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleFormat("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Type className="h-4 w-4 mr-1" />
                Font Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[1, 2, 3, 4, 5, 6, 7].map((size) => (
                <DropdownMenuItem key={size} onClick={() => handleFormat("fontSize", size.toString())}>
                  {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Type className="h-4 w-4 mr-1" />
                Font
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"].map((font) => (
                <DropdownMenuItem key={font} onClick={() => handleFormat("fontName", font)}>
                  {font}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Layout className="h-4 w-4 mr-1" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={showLineNumbers}
                onCheckedChange={setShowLineNumbers}
              >
                <Hash className="h-4 w-4 mr-2" />
                Show Line Numbers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={enableSyntaxHighlighting}
                onCheckedChange={setEnableSyntaxHighlighting}
              >
                <Code className="h-4 w-4 mr-2" />
                Syntax Highlighting
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button variant="ghost" size="icon" onClick={() => handleFormat("strikeThrough")}>
            <Strikethrough className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Text color picker */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                handleFormat("foreColor", e.target.value);
              }}
              className="w-5 h-5 cursor-pointer"
              aria-label="Text color"
            />
            <Palette className="h-4 w-4" />
          </div>

          {/* Background color picker */}
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => {
                setBgColor(e.target.value);
                handleFormat("hiliteColor", e.target.value);
              }}
              className="w-5 h-5 cursor-pointer"
              aria-label="Background color"
            />
            <PaintBucket className="h-4 w-4" />
          </div>
        </div>

        {/* Editor Area */}
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
            <div className="relative h-full">
              {renderLineNumbers()}
              <div
                ref={editorRef}
                className={`border rounded p-4 h-full focus:outline-none overflow-auto ${showLineNumbers ? 'pl-12' : ''}`}
                contentEditable={true}
                onInput={handleInput}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
              />
            </div>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 p-4">
            <div
              className="preview-content border rounded p-4 h-full overflow-auto"
              dangerouslySetInnerHTML={{
                __html: enableSyntaxHighlighting ? applySyntaxHighlighting(content) : content
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Status Bar */}
        <footer className="border-t p-2 text-sm text-muted-foreground flex justify-between">
          <div className="flex items-center gap-2">
            <span>Characters: {content.replace(/<[^>]*>/g, '').length}</span>
            {autoSave && (
              <span className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'}`}></span>
                {syncStatus === 'synced' ? 'Saved' : syncStatus === 'syncing' ? 'Saving...' : 'Offline'}
              </span>
            )}
          </div>
          <div>
            TextEditor 2.0
          </div>
        </footer>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Configure your editor preferences.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto Save</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save document changes
                  </p>
                </div>
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              {autoSave && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="save-interval">Save Interval (seconds)</Label>
                  <input
                    id="save-interval"
                    type="number"
                    min="5"
                    max="300"
                    value={autoSaveInterval}
                    onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                    className="w-20 p-2 border rounded"
                  />
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Ctrl+B</div><div>Bold</div>
                  <div>Ctrl+I</div><div>Italic</div>
                  <div>Ctrl+U</div><div>Underline</div>
                  <div>Ctrl+S</div><div>Save</div>
                  <div>Ctrl+L</div><div>Bullet List</div>
                  <div>Ctrl+O</div><div>Numbered List</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
