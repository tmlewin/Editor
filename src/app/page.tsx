import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

// Update the exportAsPDF function with loading state and better error handling
const [isExporting, setIsExporting] = useState(false);

const exportAsPDF = async () => {
  if (!editorRef.current || isExporting) return;
  
  try {
    // Set exporting state to show loading indicator
    setIsExporting(true);
    
    // Get current content
    const contentToExport = editorRef.current.innerHTML;
    
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = contentToExport;
    
    // Apply basic styling to the temp container
    tempContainer.style.padding = '20px';
    tempContainer.style.color = 'black';
    tempContainer.style.backgroundColor = 'white';
    
    // Convert OKLCH colors to RGB in the content
    const elements = tempContainer.querySelectorAll('*');
    elements.forEach(el => {
      const element = el as HTMLElement;
      if (element.style.color && element.style.color.includes('oklch')) {
        element.style.color = 'black';
      }
      if (element.style.backgroundColor && element.style.backgroundColor.includes('oklch')) {
        element.style.backgroundColor = 'white';
      }
    });
    
    // Dynamically import html2pdf
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default;
    
    // Configure the PDF options
    const opt = {
      margin: 1,
      filename: `${documentTitle || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Generate the PDF with a timeout to prevent infinite processing
    const pdfPromise = html2pdf().from(tempContainer).set(opt).save();
    
    // Set a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF generation timed out')), 15000);
    });
    
    await Promise.race([pdfPromise, timeoutPromise]);
    
    // Clean up
    tempContainer.remove();
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("There was an error generating the PDF. Please try again.");
  } finally {
    setIsExporting(false);
  }
};

// Update the DropdownMenuItem for PDF export to show loading state
<DropdownMenuItem 
  onClick={exportAsPDF}
  disabled={isExporting}
>
  {isExporting ? (
    <>
      <span className="h-4 w-4 mr-2 animate-spin">⏳</span>
      Exporting...
    </>
  ) : (
    <>
      <FileDown className="h-4 w-4 mr-2" />
      Export as PDF
    </>
  )}
</DropdownMenuItem> 