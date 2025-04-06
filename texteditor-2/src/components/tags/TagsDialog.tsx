"use client";

import { useState, useEffect } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Document } from "@/types/document";
import { Tag, TagsService } from "@/services/tagsService";

interface TagsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  document: Document | null;
  onTagsUpdate: (documentId: number, oldTags: string[], newTags: string[]) => Promise<void>;
}

export default function TagsDialog({ 
  open, 
  setOpen, 
  document, 
  onTagsUpdate 
}: TagsDialogProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load available tags when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableTags();
      // Initialize with document's current tags
      setTags(document?.tags || []);
    }
  }, [open, document]);

  const loadAvailableTags = async () => {
    setIsLoading(true);
    try {
      const allTags = await TagsService.getAllTags();
      setAvailableTags(allTags);
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    
    // Normalize tag name
    const normalizedTag = newTagName.trim().toLowerCase();
    
    // Check if tag already exists in the current list
    if (!tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
    }
    
    setNewTagName("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSelectExistingTag = (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    
    setIsSaving(true);
    try {
      await onTagsUpdate(document.id, document.tags, tags);
      setOpen(false);
    } catch (error) {
      console.error("Error saving tags:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Add or remove tags for "{document?.title || 'Untitled Document'}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Current tags */}
          <div>
            <Label htmlFor="current-tags">Current Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 min-h-10 p-2 border rounded-md">
              {tags.length === 0 ? (
                <span className="text-sm text-muted-foreground">No tags added yet</span>
              ) : (
                tags.map(tag => (
                  <div 
                    key={tag} 
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                  >
                    <TagIcon className="h-3 w-3" />
                    <span>{tag}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 rounded-full" 
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add new tag */}
          <div>
            <Label htmlFor="new-tag">Add New Tag</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="new-tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button onClick={handleAddTag} disabled={!newTagName.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Available tags */}
          <div>
            <Label>Available Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-md">
              {isLoading ? (
                <span className="text-sm text-muted-foreground">Loading tags...</span>
              ) : availableTags.length === 0 ? (
                <span className="text-sm text-muted-foreground">No tags available</span>
              ) : (
                availableTags.map(tag => (
                  <Button
                    key={tag.id}
                    variant={tags.includes(tag.name) ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSelectExistingTag(tag.name)}
                  >
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name} ({tag.count})
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
