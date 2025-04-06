"use client";

interface EditorFooterProps {
  content: string;
  autoSave: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
}

export default function EditorFooter({
  content,
  autoSave,
  syncStatus,
}: EditorFooterProps) {
  // Calculate character count without HTML tags
  const characterCount = content.replace(/<[^>]*>/g, '').length;

  return (
    <footer className="border-t p-2 text-sm text-muted-foreground flex justify-between">
      <div className="flex items-center gap-2">
        <span>Characters: {characterCount}</span>
        {autoSave && (
          <span className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500'}`}></span>
            {syncStatus === 'synced' ? 'Saved' : syncStatus === 'syncing' ? 'Saving...' : 'Offline'}
          </span>
        )}
      </div>
      <div>
        TextEditor 2.0
      </div>
    </footer>
  );
}