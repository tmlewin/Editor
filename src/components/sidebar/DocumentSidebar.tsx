"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tag, Trash2 } from "lucide-react";
import { Document } from "@/types/document";
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

interface DocumentSidebarProps {
  documents: Document[];
  createNewDocument: () => void;
  loadDocument: (doc: Document) => void;
  handleDeleteDocument: (doc: Document) => void;
}

export default function DocumentSidebar({
  documents,
  createNewDocument,
  loadDocument,
  handleDeleteDocument,
}: DocumentSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

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

  return (
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
              className="p-2 text-sm rounded hover:bg-muted group relative"
            >
              <div 
                onClick={() => loadDocument(doc)}
                className="cursor-pointer"
              >
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Modified: {doc.modifiedAt.toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Delete button and confirmation dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDocumentToDelete(doc);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive"
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
} 