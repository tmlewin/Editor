import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  getDoc,
  arrayUnion,
  arrayRemove,
  updateDoc
} from 'firebase/firestore';

// Collection reference
const TAGS_COLLECTION = 'tags';
const DOCUMENTS_COLLECTION = 'documents';

// Tag type definition
export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: Date;
  count: number; // Number of documents using this tag
}

export const TagsService = {
  /**
   * Get all tags from Firestore
   */
  getAllTags: async (): Promise<Tag[]> => {
    try {
      const q = query(collection(db, TAGS_COLLECTION), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          color: data.color || '#6b7280', // Default gray color
          createdAt: data.createdAt?.toDate() || new Date(),
          count: data.count || 0
        };
      });
    } catch (error) {
      console.error('Error getting tags from Firestore:', error);
      return [];
    }
  },

  /**
   * Create a new tag in Firestore
   */
  createTag: async (tagName: string, color?: string): Promise<Tag | null> => {
    try {
      // Normalize tag name (lowercase, trim)
      const normalizedName = tagName.trim().toLowerCase();
      
      // Check if tag already exists
      const tagRef = doc(db, TAGS_COLLECTION, normalizedName);
      const tagDoc = await getDoc(tagRef);
      
      if (tagDoc.exists()) {
        // Tag already exists, return it
        const data = tagDoc.data();
        return {
          id: tagDoc.id,
          name: data.name,
          color: data.color || '#6b7280',
          createdAt: data.createdAt?.toDate() || new Date(),
          count: data.count || 0
        };
      }
      
      // Create new tag
      const newTag: Omit<Tag, 'id'> = {
        name: normalizedName,
        color: color || '#6b7280',
        createdAt: new Date(),
        count: 0
      };
      
      // Use the normalized name as the document ID
      await setDoc(doc(db, TAGS_COLLECTION, normalizedName), {
        ...newTag,
        createdAt: Timestamp.fromDate(newTag.createdAt)
      });
      
      return {
        id: normalizedName,
        ...newTag
      };
    } catch (error) {
      console.error('Error creating tag in Firestore:', error);
      return null;
    }
  },

  /**
   * Delete a tag from Firestore
   */
  deleteTag: async (tagId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, TAGS_COLLECTION, tagId));
      return true;
    } catch (error) {
      console.error('Error deleting tag from Firestore:', error);
      return false;
    }
  },

  /**
   * Update tag count (increment or decrement)
   */
  updateTagCount: async (tagId: string, increment: boolean): Promise<void> => {
    try {
      const tagRef = doc(db, TAGS_COLLECTION, tagId);
      const tagDoc = await getDoc(tagRef);
      
      if (tagDoc.exists()) {
        const currentCount = tagDoc.data().count || 0;
        await updateDoc(tagRef, {
          count: increment ? currentCount + 1 : Math.max(0, currentCount - 1)
        });
      }
    } catch (error) {
      console.error('Error updating tag count in Firestore:', error);
    }
  },

  /**
   * Add a tag to a document
   */
  addTagToDocument: async (documentId: number, tagName: string): Promise<boolean> => {
    try {
      // First ensure the tag exists
      const tag = await TagsService.createTag(tagName);
      if (!tag) return false;
      
      // Add tag to document
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId.toString());
      await updateDoc(docRef, {
        tags: arrayUnion(tag.name)
      });
      
      // Increment tag count
      await TagsService.updateTagCount(tag.id, true);
      
      return true;
    } catch (error) {
      console.error('Error adding tag to document in Firestore:', error);
      return false;
    }
  },

  /**
   * Remove a tag from a document
   */
  removeTagFromDocument: async (documentId: number, tagName: string): Promise<boolean> => {
    try {
      // Remove tag from document
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId.toString());
      await updateDoc(docRef, {
        tags: arrayRemove(tagName)
      });
      
      // Decrement tag count
      await TagsService.updateTagCount(tagName, false);
      
      return true;
    } catch (error) {
      console.error('Error removing tag from document in Firestore:', error);
      return false;
    }
  },

  /**
   * Update document tags (replace all tags)
   */
  updateDocumentTags: async (documentId: number, oldTags: string[], newTags: string[]): Promise<boolean> => {
    try {
      // Normalize all tags
      const normalizedNewTags = newTags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
      const normalizedOldTags = oldTags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
      
      // Find tags to add and remove
      const tagsToAdd = normalizedNewTags.filter(tag => !normalizedOldTags.includes(tag));
      const tagsToRemove = normalizedOldTags.filter(tag => !normalizedNewTags.includes(tag));
      
      // Create any new tags that don't exist yet
      await Promise.all(tagsToAdd.map(tag => TagsService.createTag(tag)));
      
      // Update document with new tags
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId.toString());
      await updateDoc(docRef, {
        tags: normalizedNewTags
      });
      
      // Update tag counts
      await Promise.all([
        ...tagsToAdd.map(tag => TagsService.updateTagCount(tag, true)),
        ...tagsToRemove.map(tag => TagsService.updateTagCount(tag, false))
      ]);
      
      return true;
    } catch (error) {
      console.error('Error updating document tags in Firestore:', error);
      return false;
    }
  }
};
