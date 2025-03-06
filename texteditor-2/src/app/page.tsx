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

// Update the document type to include content
// Replace or update the mockDocuments with this type
type Document = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
};

// Update the mockDocuments to include content
const mockDocuments: Document[] = [
  { 
    id: 1, 
    title: "Welcome Note", 
    content: "<p>Welcome to TextEditor 2.0! This is a sample document to help you get started.</p>", 
    tags: ["welcome", "tutorial"], 
    createdAt: new Date(2023, 2, 15), 
    modifiedAt: new Date(2023, 2, 16) 
  },
  { 
    id: 2, 
    title: "Project Ideas", 
    content: "<p>Here are some project ideas to consider:</p><ul><li>Task management app</li><li>Recipe organizer</li><li>Fitness tracker</li></ul>", 
    tags: ["ideas", "projects"], 
    createdAt: new Date(2023, 3, 10), 
    modifiedAt: new Date(2023, 3, 20) 
  },
  { 
    id: 3, 
    title: "Meeting Notes", 
    content: "<p>Meeting agenda:</p><ol><li>Project updates</li><li>Timeline review</li><li>Next steps</li></ol>", 
    tags: ["meeting", "work"], 
    createdAt: new Date(2023, 4, 5), 
    modifiedAt: new Date(2023, 4, 5) 
  }
];

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
  const [documentsVisible, setDocumentsVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30); // seconds

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

  // Filter documents based on search and selected tags
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      doc.tags.some(tag => selectedTags.includes(tag));
    return matchesSearch && matchesTags;
  });
  
  // Get all unique tags from documents
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  );
  
  // Function to toggle a tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  // Create a new document
  const createNewDocument = () => {
    const newDoc: Document = {
      id: Date.now(),
      title: "Untitled Document",
      content: "",
      tags: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setDocumentTitle(newDoc.title);
    setContent("");
    
    // Clear editor
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };
  
  // Load a document
  const loadDocument = (doc: Document) => {
    setDocumentTitle(doc.title);
    setContent(doc.content || '');
    
    // Update editor content
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = doc.content || '';
      }
    }, 0);
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

  // Add this function to load documents from localStorage on initial load
  useEffect(() => {
    const savedDocuments = localStorage.getItem('texteditor-documents');
    if (savedDocuments) {
      try {
        // Parse dates properly
        const parsedDocs = JSON.parse(savedDocuments, (key, value) => {
          if (key === 'createdAt' || key === 'modifiedAt') {
            return new Date(value);
          }
          return value;
        });
        setDocuments(parsedDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Update the saveContent function
  const saveDocument = () => {
    if (editorRef.current) {
      // Get current content
      const currentContent = editorRef.current.innerHTML;
      setContent(currentContent);
      
      // Find or create document
      const existingDocIndex = documents.findIndex(doc => doc.title === documentTitle);
      
      if (existingDocIndex >= 0) {
        // Update existing document
        const updatedDocs = [...documents];
        updatedDocs[existingDocIndex] = {
          ...updatedDocs[existingDocIndex],
          content: currentContent,
          modifiedAt: new Date()
        };
        setDocuments(updatedDocs);
        
        // Save to localStorage
        localStorage.setItem('texteditor-documents', JSON.stringify(updatedDocs));
      } else {
        // Create new document
        const newDoc: Document = {
          id: Date.now(),
          title: documentTitle,
          content: currentContent,
          tags: [],
          createdAt: new Date(),
          modifiedAt: new Date()
        };
        
        const newDocs = [newDoc, ...documents];
        setDocuments(newDocs);
        
        // Save to localStorage
        localStorage.setItem('texteditor-documents', JSON.stringify(newDocs));
      }
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

  // Implement auto-save functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoSave) {
      interval = setInterval(() => {
        saveDocument();
      }, autoSaveInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoSave, autoSaveInterval]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Document Management Panel */}
      {documentsVisible && (
        <aside className="w-64 border-r p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Documents</h2>
            <Button variant="ghost" size="icon" onClick={createNewDocument}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <Input 
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <Button 
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className="text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <h3 className="text-sm font-medium mb-2">Files</h3>
            <ul className="space-y-1">
              {filteredDocuments.map(doc => (
                <li 
                  key={doc.id}
                  onClick={() => loadDocument(doc)}
                  className="p-2 text-sm rounded hover:bg-muted cursor-pointer"
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>Modified: {doc.modifiedAt.toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
          <div>
            Characters: {content.replace(/<[^>]*>/g, '').length}
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
