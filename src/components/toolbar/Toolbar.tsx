"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Type,
  Layout,
  Hash,
  Code,
  Strikethrough,
  PaintBucket,
  Palette,
} from "lucide-react";

interface ToolbarProps {
  handleFormat: (command: string, value?: string) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  enableSyntaxHighlighting: boolean;
  setEnableSyntaxHighlighting: (enable: boolean) => void;
}

export default function Toolbar({
  handleFormat,
  showLineNumbers,
  setShowLineNumbers,
  enableSyntaxHighlighting,
  setEnableSyntaxHighlighting,
}: ToolbarProps) {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  
  return (
    <div className="p-2 border-b flex flex-wrap gap-1 items-center">
      <Button variant="ghost" size="icon" onClick={() => handleFormat("bold")}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("italic")}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("underline")}>
        <Underline className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyLeft")}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyCenter")}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyRight")}>
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("justifyFull")}>
        <AlignJustify className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleFormat("insertUnorderedList")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleFormat("insertOrderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Type className="h-4 w-4 mr-1" />
            Font Size
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {[1, 2, 3, 4, 5, 6, 7].map((size) => (
            <DropdownMenuItem key={size} onClick={() => handleFormat("fontSize", size.toString())}>
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Type className="h-4 w-4 mr-1" />
            Font
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"].map((font) => (
            <DropdownMenuItem key={font} onClick={() => handleFormat("fontName", font)}>
              {font}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Layout className="h-4 w-4 mr-1" />
            Options
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={showLineNumbers}
            onCheckedChange={setShowLineNumbers}
          >
            <Hash className="h-4 w-4 mr-2" />
            Show Line Numbers
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={enableSyntaxHighlighting}
            onCheckedChange={setEnableSyntaxHighlighting}
          >
            <Code className="h-4 w-4 mr-2" />
            Syntax Highlighting
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      <Button variant="ghost" size="icon" onClick={() => handleFormat("strikeThrough")}>
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Text color picker */}
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={textColor}
          onChange={(e) => {
            setTextColor(e.target.value);
            handleFormat("foreColor", e.target.value);
          }}
          className="w-5 h-5 cursor-pointer"
          aria-label="Text color"
        />
        <Palette className="h-4 w-4" />
      </div>
      
      {/* Background color picker */}
      <div className="flex items-center gap-1">
        <input
          type="color"
          value={bgColor}
          onChange={(e) => {
            setBgColor(e.target.value);
            handleFormat("hiliteColor", e.target.value);
          }}
          className="w-5 h-5 cursor-pointer"
          aria-label="Background color"
        />
        <PaintBucket className="h-4 w-4" />
      </div>
    </div>
  );
} 