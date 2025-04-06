"use client";

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
  Layout,
  Hash,
  Code,
  Strikethrough,
  PaintBucket,
  Palette,
  Superscript,
  Subscript,
  Highlighter,
  ImageIcon,
  Link,
  Indent,
  Outdent,
  Quote,
  Minus,
  Table,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorToolbarProps {
  handleFormat: (command: string, value?: string) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  enableSyntaxHighlighting: boolean;
  setEnableSyntaxHighlighting: (enable: boolean) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  handleImageInsertion: () => void;
}

export default function EditorToolbar({
  handleFormat,
  showLineNumbers,
  setShowLineNumbers,
  enableSyntaxHighlighting,
  setEnableSyntaxHighlighting,
  textColor,
  setTextColor,
  bgColor,
  setBgColor,
  handleImageInsertion,
}: EditorToolbarProps) {
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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat("indent")}
        title="Indent"
      >
        <Indent className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat("outdent")}
        title="Outdent"
      >
        <Outdent className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat("formatBlock", "blockquote")}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat("insertHorizontalRule")}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat("insertTable")}
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Media insertion */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleImageInsertion}
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) {
            // Ensure URL has a protocol
            let formattedUrl = url.trim();
            if (!/^https?:\/\//i.test(formattedUrl)) {
              formattedUrl = "https://" + formattedUrl;
            }
            handleFormat("createLink", formattedUrl);
          }
        }}
        title="Insert Link"
      >
        <Link className="h-4 w-4" />
      </Button>

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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleFormat('superscript')}
      >
        <Superscript className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleFormat("subscript")}>
        <Subscript className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Font Family Dropdown */}
      <Select onValueChange={(value) => handleFormat("fontName", value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
          <SelectItem value="Courier New">Courier New</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
        </SelectContent>
      </Select>

      {/* Font Size Dropdown */}
      <Select onValueChange={(value) => handleFormat("fontSize", value)}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7].map(size => (
            <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Heading Dropdown */}
      <Select onValueChange={(value) => handleFormat("formatBlock", value)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Normal</SelectItem>
          {["H1", "H2", "H3", "H4", "H5", "H6"].map(heading => (
            <SelectItem key={heading} value={heading.toLowerCase()}>{heading}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Highlight Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => handleFormat("backColor", "yellow")}
        className="highlight-button"
      >
        <Highlighter className="h-4 w-4" />
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