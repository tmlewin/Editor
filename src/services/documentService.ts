import { Document } from "@/types/document";

/**
 * Service for document operations (save, export, etc.)
 */
export const DocumentService = {
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

  saveToLocalStorage: (documents: Document[]): void => {
    localStorage.setItem('texteditor-documents', JSON.stringify(documents));
  },

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
  }
}; 