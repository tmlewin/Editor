"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tag, Trash2, Tags } from "lucide-react";
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
import TagsDialog from "@/components/tags/TagsDialog";

interface DocumentSidebarProps {
  documents: Document[];
  createNewDocument: () => void;
  loadDocument: (doc: Document) => void;
  handleDeleteDocument: (doc: Document) => void;
  updateDocumentTags: (documentId: number, oldTags: string[], newTags: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function DocumentSidebar({
  documents,
  createNewDocument,
  loadDocument,
  handleDeleteDocument,
  updateDocumentTags,
  isLoading = false,
}: DocumentSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

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

  // Open tags dialog for a document
  const openTagsDialog = (doc: Document) => {
    setSelectedDocument(doc);
    setTagsDialogOpen(true);
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
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-sm text-muted-foreground">Loading documents...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            <p>No documents found</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={createNewDocument}
            >
              Create your first document
            </Button>
          </div>
        ) : (
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
                  
                  {/* Display document tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doc.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Document actions */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {/* Tags button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      openTagsDialog(doc);
                    }}
                  >
                    <Tags className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  
                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentToDelete(doc);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Tags Dialog */}
      <TagsDialog
        open={tagsDialogOpen}
        setOpen={setTagsDialogOpen}
        document={selectedDocument}
        onTagsUpdate={updateDocumentTags}
      />
    </aside>
  );
}
