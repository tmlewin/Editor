"use client";

import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { applySyntaxHighlighting } from "@/utils/syntaxHighlighter";

interface EditorAreaProps {
  content: string;
  setContent: (content: string) => void;
  showLineNumbers: boolean;
  enableSyntaxHighlighting: boolean;
  handleInput: () => void;
  handleEditorUpdate: () => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleTabChange: (value: string) => void;
  handleBlur: () => void;
}

export default function EditorArea({
  content,
  setContent,
  showLineNumbers,
  enableSyntaxHighlighting,
  handleInput,
  handleEditorUpdate,
  handlePaste,
  handleTabChange,
  handleBlur,
}: EditorAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync content state with editorRef
  useEffect(() => {
    if (editorRef.current) {
      // Only update if the current content is different to avoid cursor position issues
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
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

  return (
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
            id="editor"
            className={`border rounded p-4 h-full focus:outline-none overflow-auto ${showLineNumbers ? 'pl-12' : ''}`}
            contentEditable={true}
            onInput={handleInput}
            onPaste={handlePaste}
            onBlur={handleBlur}
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
  );
} 