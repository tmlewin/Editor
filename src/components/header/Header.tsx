"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Folder, FileText, Maximize, Minimize, Sun, Moon, Save, Download, Settings as SettingsIcon, FileDown, FileText as FileTextIcon, FileCode } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  toggleFullScreen: () => void;
  isFullScreen: boolean;
  saveDocument: () => void;
  exportAsPDF: () => void;
  exportAsMarkdown: () => void;
  exportAsHTML: () => void;
  toggleDocumentsPanel: () => void;
  openSettings: () => void;
}

export default function Header({
  documentTitle,
  setDocumentTitle,
  toggleFullScreen,
  isFullScreen,
  saveDocument,
  exportAsPDF,
  exportAsMarkdown,
  exportAsHTML,
  toggleDocumentsPanel,
  openSettings,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure we only render theme-dependent UI after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b p-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDocumentsPanel}
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
        <Button variant="outline" size="icon" onClick={toggleFullScreen}>
          {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {mounted ? (
            theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" />
          )}
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
        <Button variant="outline" size="icon" onClick={openSettings}>
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
} 