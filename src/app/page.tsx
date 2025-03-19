"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Document } from "@/types/document";
import { mockDocuments } from "@/data/mockDocuments";
import { DocumentService } from "@/services/documentService";

// Components
import DocumentSidebar from "@/components/sidebar/DocumentSidebar";
import Header from "@/components/header/Header";
import Toolbar from "@/components/toolbar/Toolbar";
import EditorArea from "@/components/editor/EditorArea";
import SettingsDialog from "@/components/settings/SettingsDialog";
import StatusBar from "@/components/footer/StatusBar";

export default function Home() {
  // State
  const [content, setContent] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("Untitled Document");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [enableSyntaxHighlighting, setEnableSyntaxHighlighting] = useState(false);
  const [documentsVisible, setDocumentsVisible] = useState(true);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30); // seconds
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [showAutoSaveIndicator, setShowAutoSaveIndicator] = useState(false);
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load documents from localStorage on initial render
  useEffect(() => {
    const savedDocuments = DocumentService.loadFromLocalStorage();
    if (savedDocuments) {
      setDocuments(savedDocuments);
    }
  }, []);
  
  // Handle editor content updates
  const handleEditorUpdate = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      
      // If we have a current document, just update its content in memory
      if (currentDocument) {
        // IMPORTANT: Don't create a new document here, just update the current one
        const updatedDocument = {
          ...currentDocument,
          content: newContent,
          modifiedAt: new Date()
        };
        
        setCurrentDocument(updatedDocument);
      }
      // Only create a new document if specifically needed, not during regular edits
    }
  };
  
  // Handle paste events to clean up formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
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
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Handle formatting commands
  const handleFormat = (command: string, value: string | undefined = undefined) => {
    if (document.activeElement?.id !== "editor") {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
    
    document.execCommand(command, false, value);
    handleEditorUpdate();
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [documents, currentDocument, documentTitle, content]);
  
  // Save the current document
  const saveDocument = () => {
    if (!content) return;
    
    // Show auto-save indicator
    setShowAutoSaveIndicator(true);
    setTimeout(() => setShowAutoSaveIndicator(false), 1500);
    
    if (currentDocument) {
      // Update existing document
      const updatedDocument = {
        ...currentDocument,
        title: documentTitle,
        content: content,
        modifiedAt: new Date()
      };
      
      // Replace the existing document
      const updatedDocuments = documents.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      );
      
      setDocuments(updatedDocuments);
      setCurrentDocument(updatedDocument);
      DocumentService.saveToLocalStorage(updatedDocuments);
      console.log("Updated existing document:", updatedDocument.title);
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
      DocumentService.saveToLocalStorage(updatedDocuments);
      console.log("Created new document:", newDocument.title);
    }
  };
  
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
  }, [autoSave, autoSaveInterval]);
  
  // Create a new document
  const createNewDocument = () => {
    // Save any existing content before creating a new document
    if (currentDocument && content) {
      saveDocument();
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
    DocumentService.saveToLocalStorage(updatedDocuments);
    
    return newDocument;
  };
  
  // Load an existing document
  const loadDocument = (doc: Document) => {
    // First, save any changes to the current document before switching
    if (currentDocument && content) {
      saveDocument();
    }
    
    // Then switch to the new document
    setCurrentDocument(doc);
    setDocumentTitle(doc.title);
    setContent(doc.content);
    
    // Set editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = doc.content;
    }
    
    // Switch to edit tab when loading a document
    setActiveTab("edit");
  };
  
  // Delete a document
  const handleDeleteDocument = (doc: Document) => {
    const updatedDocuments = documents.filter(d => d.id !== doc.id);
    setDocuments(updatedDocuments);
    DocumentService.saveToLocalStorage(updatedDocuments);
    
    // If we're deleting the current document, clear the editor
    if (currentDocument && currentDocument.id === doc.id) {
      setCurrentDocument(null);
      setDocumentTitle("Untitled Document");
      setContent("");
    }
  };
  
  // Export functions
  const exportAsPDF = () => {
    DocumentService.exportAsPDF(documentTitle, content);
  };
  
  const exportAsMarkdown = () => {
    DocumentService.exportAsMarkdown(documentTitle, content);
  };
  
  const exportAsHTML = () => {
    DocumentService.exportAsHTML(documentTitle, content);
  };

  // Toggle documents panel
  const toggleDocumentsPanel = () => {
    setDocumentsVisible(!documentsVisible);
  };
  
  // Open settings dialog
  const openSettings = () => {
    setSettingsOpen(true);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Save content when editor loses focus
  const handleEditorBlur = () => {
    if (currentDocument && content && autoSave) {
      saveDocument();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        documentTitle={documentTitle}
        setDocumentTitle={setDocumentTitle}
        toggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
        saveDocument={saveDocument}
        exportAsPDF={exportAsPDF}
        exportAsMarkdown={exportAsMarkdown}
        exportAsHTML={exportAsHTML}
        toggleDocumentsPanel={toggleDocumentsPanel}
        openSettings={openSettings}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {documentsVisible && (
          <DocumentSidebar 
            documents={documents}
            createNewDocument={createNewDocument}
            loadDocument={loadDocument}
            handleDeleteDocument={handleDeleteDocument}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            handleFormat={handleFormat}
            showLineNumbers={showLineNumbers}
            setShowLineNumbers={setShowLineNumbers}
            enableSyntaxHighlighting={enableSyntaxHighlighting}
            setEnableSyntaxHighlighting={setEnableSyntaxHighlighting}
          />
          
          <EditorArea
            content={content}
            setContent={setContent}
            showLineNumbers={showLineNumbers}
            enableSyntaxHighlighting={enableSyntaxHighlighting}
            handleInput={handleInput}
            handleEditorUpdate={handleEditorUpdate}
            handlePaste={handlePaste}
            handleBlur={handleEditorBlur}
            handleTabChange={handleTabChange}
            editorRef={editorRef}
          />
          
          <StatusBar content={content} showAutoSaveIndicator={showAutoSaveIndicator} />
        </div>
      </div>
      
      <SettingsDialog
        open={settingsOpen}
        setOpen={setSettingsOpen}
        autoSave={autoSave}
        setAutoSave={setAutoSave}
        autoSaveInterval={autoSaveInterval}
        setAutoSaveInterval={setAutoSaveInterval}
      />
    </div>
  );
} 