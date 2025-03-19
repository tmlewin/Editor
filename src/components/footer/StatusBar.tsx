interface StatusBarProps {
  content: string;
  showAutoSaveIndicator?: boolean;
}

export default function StatusBar({ content, showAutoSaveIndicator }: StatusBarProps) {
  // Calculate word count and character count
  const text = content.replace(/<[^>]*>/g, '');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  
  return (
    <div className="border-t p-2 text-xs flex justify-between items-center text-muted-foreground">
      <div>
        {wordCount} words | {charCount} characters
      </div>
      {showAutoSaveIndicator && (
        <div className="text-green-500 animate-pulse">
          Saving...
        </div>
      )}
    </div>
  );
} 