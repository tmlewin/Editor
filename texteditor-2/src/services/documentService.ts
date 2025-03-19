import { Document } from "@/types/document";
import { FirestoreService } from "./firestoreService";

/**
 * Service for document operations (save, export, etc.)
 */
export const DocumentService = {
  /**
   * Export document as PDF
   */
  exportAsPDF: async (documentTitle: string, content: string): Promise<void> => {
    try {
      // Show loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'fixed top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center z-50';
      loadingIndicator.innerHTML = '<div class="bg-background p-4 rounded shadow-lg">Generating PDF...</div>';
      document.body.appendChild(loadingIndicator);
      
      // Use setTimeout to allow UI to update before heavy PDF work begins
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Use Web Workers for PDF generation if possible
      const pdfBlob = await new Promise<Blob>((resolve) => {
        // Move this to a separate worker thread to prevent UI freezing
        setTimeout(async () => {
          // Your existing PDF generation code here
          // Example using html2pdf or similar:
          const element = document.createElement('div');
          element.innerHTML = content;
          
          const opt = {
            margin: [10, 10, 10, 10],
            filename: `${documentTitle}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          // Generate PDF
          const pdf = await html2pdf().from(element).set(opt).outputPdf();
          
          // Convert to blob
          const blob = new Blob([pdf], { type: 'application/pdf' });
          resolve(blob);
        }, 50); // Short delay to let UI update
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}.pdf`;
      document.body.appendChild(a);
      
      // Trigger download
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      document.body.removeChild(loadingIndicator);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Remove loading indicator in case of error
      const loadingIndicator = document.querySelector('.fixed.top-0.left-0.w-full.h-full');
      if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
      }
    }
  },

  /**
   * Export document as Markdown
   */
  exportAsMarkdown: async (documentTitle: string, content: string): Promise<void> => {
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
  },

  /**
   * Export document as HTML
   */
  exportAsHTML: (documentTitle: string, content: string): void => {
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
  },

  /**
   * Save documents to local storage
   */
  saveToLocalStorage: (documents: Document[]): void => {
    localStorage.setItem('texteditor-documents', JSON.stringify(documents));
  },

  /**
   * Load documents from local storage
   */
  loadFromLocalStorage: (): Document[] | null => {
    const savedDocuments = localStorage.getItem('texteditor-documents');
    if (!savedDocuments) return null;
    
    try {
      // Parse dates properly
      return JSON.parse(savedDocuments, (key, value) => {
        if (key === 'createdAt' || key === 'modifiedAt') {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error('Error loading documents:', error);
      return null;
    }
  },

  /**
   * Save documents to both local storage and Firestore
   */
  saveDocuments: async (documents: Document[]): Promise<void> => {
    // First save to local storage (fast, no network dependency)
    DocumentService.saveToLocalStorage(documents);
    
    // Then save to Firestore (might take longer, network dependent)
    try {
      await FirestoreService.saveDocuments(documents);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      // Continue even if Firestore save fails - we have local backup
    }
  },

  /**
   * Save a single document to both local storage and Firestore
   */
  saveDocument: async (document: Document, allDocuments: Document[]): Promise<void> => {
    // Update the document in the full list
    const updatedDocuments = allDocuments.map(doc => 
      doc.id === document.id ? document : doc
    );
    
    // If document doesn't exist in the list, add it
    if (!updatedDocuments.some(doc => doc.id === document.id)) {
      updatedDocuments.push(document);
    }
    
    // Save to local storage first
    DocumentService.saveToLocalStorage(updatedDocuments);
    
    // Then save to Firestore
    try {
      await FirestoreService.saveDocument(document);
    } catch (error) {
      console.error('Error saving document to Firestore:', error);
      // Continue even if Firestore save fails - we have local backup
    }
  },

  /**
   * Delete a document from both local storage and Firestore
   */
  deleteDocument: async (documentId: number, allDocuments: Document[]): Promise<Document[]> => {
    // Remove from local list
    const updatedDocuments = allDocuments.filter(doc => doc.id !== documentId);
    
    // Save updated list to local storage
    DocumentService.saveToLocalStorage(updatedDocuments);
    
    // Delete from Firestore
    try {
      await FirestoreService.deleteDocument(documentId);
    } catch (error) {
      console.error('Error deleting document from Firestore:', error);
      // Continue even if Firestore delete fails
    }
    
    return updatedDocuments;
  },

  /**
   * Load documents from both sources, with priority to Firestore
   * Falls back to local storage if Firestore fails
   */
  loadDocuments: async (): Promise<Document[]> => {
    try {
      // Try to load from Firestore first
      const firestoreDocuments = await FirestoreService.getAllDocuments();
      
      if (firestoreDocuments && firestoreDocuments.length > 0) {
        // If we got documents from Firestore, update local storage
        DocumentService.saveToLocalStorage(firestoreDocuments);
        return firestoreDocuments;
      }
      
      // If no documents in Firestore, try local storage
      const localDocuments = DocumentService.loadFromLocalStorage();
      
      if (localDocuments && localDocuments.length > 0) {
        // If we have local documents but none in Firestore, sync them up
        try {
          await FirestoreService.saveDocuments(localDocuments);
        } catch (error) {
          console.error('Error syncing local documents to Firestore:', error);
        }
        return localDocuments;
      }
      
      // If no documents anywhere, return empty array
      return [];
    } catch (error) {
      console.error('Error loading documents from Firestore:', error);
      
      // Fall back to local storage
      const localDocuments = DocumentService.loadFromLocalStorage();
      return localDocuments || [];
    }
  },

  /**
   * Sync local documents with Firestore
   * Useful when coming back online after being offline
   */
  syncWithFirestore: async (localDocuments: Document[]): Promise<Document[]> => {
    try {
      // Get documents from Firestore
      const firestoreDocuments = await FirestoreService.getAllDocuments();
      
      // Create a map of document IDs to documents for easier lookup
      const firestoreDocMap = new Map(
        firestoreDocuments.map(doc => [doc.id, doc])
      );
      
      const localDocMap = new Map(
        localDocuments.map(doc => [doc.id, doc])
      );
      
      // Merge documents, preferring the more recently modified version
      const mergedDocMap = new Map(firestoreDocMap);
      
      // Add or update with local documents that are newer
      localDocuments.forEach(localDoc => {
        const firestoreDoc = firestoreDocMap.get(localDoc.id);
        
        // If document doesn't exist in Firestore or local version is newer
        if (!firestoreDoc || localDoc.modifiedAt > firestoreDoc.modifiedAt) {
          mergedDocMap.set(localDoc.id, localDoc);
        }
      });
      
      // Convert map back to array
      const mergedDocuments = Array.from(mergedDocMap.values());
      
      // Save merged documents to both storages
      DocumentService.saveToLocalStorage(mergedDocuments);
      await FirestoreService.saveDocuments(mergedDocuments);
      
      return mergedDocuments;
    } catch (error) {
      console.error('Error syncing with Firestore:', error);
      // Return local documents if sync fails
      return localDocuments;
    }
  }
};
