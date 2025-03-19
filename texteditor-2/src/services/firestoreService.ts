import { db } from '@/lib/firebase';
import { Document } from '@/types/document';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  setDoc
} from 'firebase/firestore';

// Collection reference
const DOCUMENTS_COLLECTION = 'documents';

// Helper to convert Firestore data to Document type
const convertFromFirestore = (doc: any): Document => {
  const data = doc.data();
  return {
    id: parseInt(doc.id, 10) || Date.now(), // Use numeric ID for compatibility
    title: data.title || 'Untitled Document',
    content: data.content || '',
    tags: data.tags || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    modifiedAt: data.modifiedAt?.toDate() || new Date()
  };
};

// Helper to convert Document to Firestore data
const convertToFirestore = (document: Document) => {
  return {
    title: document.title,
    content: document.content,
    tags: document.tags,
    createdAt: Timestamp.fromDate(document.createdAt),
    modifiedAt: Timestamp.fromDate(document.modifiedAt)
  };
};

export const FirestoreService = {
  /**
   * Get all documents from Firestore
   */
  getAllDocuments: async (): Promise<Document[]> => {
    try {
      const q = query(collection(db, DOCUMENTS_COLLECTION), orderBy('modifiedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(convertFromFirestore);
    } catch (error) {
      console.error('Error getting documents from Firestore:', error);
      return [];
    }
  },

  /**
   * Save a document to Firestore
   * If the document has an ID, update it; otherwise, create a new one
   */
  saveDocument: async (document: Document): Promise<Document> => {
    try {
      const firestoreData = convertToFirestore(document);
      
      // Use the document's ID as the document ID in Firestore
      const docRef = doc(db, DOCUMENTS_COLLECTION, document.id.toString());
      await setDoc(docRef, firestoreData);
      
      return document;
    } catch (error) {
      console.error('Error saving document to Firestore:', error);
      throw error;
    }
  },

  /**
   * Delete a document from Firestore
   */
  deleteDocument: async (documentId: number): Promise<void> => {
    try {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId.toString());
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document from Firestore:', error);
      throw error;
    }
  },

  /**
   * Save multiple documents to Firestore
   * Useful for bulk operations or initial sync
   */
  saveDocuments: async (documents: Document[]): Promise<void> => {
    try {
      // Use Promise.all to perform operations in parallel
      await Promise.all(
        documents.map(document => 
          FirestoreService.saveDocument(document)
        )
      );
    } catch (error) {
      console.error('Error saving documents to Firestore:', error);
      throw error;
    }
  }
};
