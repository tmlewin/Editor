"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  Moon,
  Sun,
  Save,
  Maximize,
  Minimize,
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  FileDown,
  FileText as FileTextIcon,
  FileCode,
  Settings as SettingsIcon,
  FileText,
} from "lucide-react";

interface EditorHeaderProps {
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  documentsVisible: boolean;
  setDocumentsVisible: (visible: boolean) => void;
  theme: string;
  setTheme: (theme: string) => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  saveDocument: () => void;
  syncWithFirestore: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  exportAsPDF: () => void;
  exportAsMarkdown: () => void;
  exportAsHTML: () => void;
  setSettingsOpen: (open: boolean) => void;
}

export default function EditorHeader({
  documentTitle,
  setDocumentTitle,
  documentsVisible,
  setDocumentsVisible,
  theme,
  setTheme,
  isFullScreen,
  toggleFullScreen,
  saveDocument,
  syncWithFirestore,
  syncStatus,
  exportAsPDF,
  exportAsMarkdown,
  exportAsHTML,
  setSettingsOpen,
}: EditorHeaderProps) {
  return (
    <header className="border-b p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDocumentsVisible(!documentsVisible)}
        >
          <Folder className="h-5 w-5" />
        </Button>
        <FileText className="h-6 w-6" />
        <input
          type="text"
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-lg font-medium"
        />
      </div>
      <div className="flex items-center gap-2">
        {/* Sync status indicator */}
        <Button
          variant="ghost"
          size="icon"
          onClick={syncWithFirestore}
          disabled={syncStatus === 'syncing'}
          className="relative"
          title={syncStatus === 'synced' ? 'Synced with cloud' :
                 syncStatus === 'syncing' ? 'Syncing...' : 'Offline - Click to sync'}
        >
          {syncStatus === 'synced' ? (
            <Cloud className="h-4 w-4 text-green-500" />
          ) : syncStatus === 'syncing' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <CloudOff className="h-4 w-4 text-orange-500" />
          )}
        </Button>

        <Button variant="outline" size="icon" onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={saveDocument}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportAsPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsMarkdown}>
              <FileTextIcon className="h-4 w-4 mr-2" />
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportAsHTML}>
              <FileCode className="h-4 w-4 mr-2" />
              Export as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}