"use client";

import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Undo,
  Redo,
  Link,
  Image,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ToolbarProps {
  formatting: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    align: string;
    heading: string;
    textColor: string;
    bgColor: string;
  };
  setFormatting: React.Dispatch<React.SetStateAction<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    align: string;
    heading: string;
    textColor: string;
    bgColor: string;
  }>>;
}

export default function Toolbar({ formatting, setFormatting }: ToolbarProps) {
  const toggleFormat = (format: keyof typeof formatting) => {
    if (typeof formatting[format] === 'boolean') {
      setFormatting(prev => ({
        ...prev,
        [format]: !prev[format]
      }));
    }
  };

  const setAlign = (align: string) => {
    setFormatting(prev => ({
      ...prev,
      align
    }));
  };

  const setHeading = (heading: string) => {
    setFormatting(prev => ({
      ...prev,
      heading
    }));
  };

  const setColor = (type: 'textColor' | 'bgColor', color: string) => {
    setFormatting(prev => ({
      ...prev,
      [type]: color
    }));
  };

  return (
    <div className="border-b p-1 flex flex-wrap gap-1">
      <Button 
        size="icon" 
        variant={formatting.bold ? "default" : "ghost"} 
        onClick={() => toggleFormat('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.italic ? "default" : "ghost"} 
        onClick={() => toggleFormat('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.underline ? "default" : "ghost"} 
        onClick={() => toggleFormat('underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.strikethrough ? "default" : "ghost"} 
        onClick={() => toggleFormat('strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button 
        size="icon" 
        variant={formatting.align === 'left' ? "default" : "ghost"} 
        onClick={() => setAlign('left')}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.align === 'center' ? "default" : "ghost"} 
        onClick={() => setAlign('center')}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.align === 'right' ? "default" : "ghost"} 
        onClick={() => setAlign('right')}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant={formatting.align === 'justify' ? "default" : "ghost"} 
        onClick={() => setAlign('justify')}
      >
        <AlignJustify className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Type className="h-4 w-4" />
            {formatting.heading || "Paragraph"}
            <span className="sr-only">Font style</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setHeading("")}>
            Paragraph
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading("h1")}>
            <Heading1 className="h-4 w-4 mr-2" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setHeading("h2")}>
            <Heading2 className="h-4 w-4 mr-2" /> Heading 2
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          <span className="text-xs mr-1">Text:</span>
          <Input 
            type="color" 
            value={formatting.textColor}
            onChange={(e) => setColor('textColor', e.target.value)}
            className="w-8 h-8 p-1"
          />
        </div>
        <div className="flex items-center">
          <span className="text-xs mr-1">BG:</span>
          <Input 
            type="color" 
            value={formatting.bgColor}
            onChange={(e) => setColor('bgColor', e.target.value)}
            className="w-8 h-8 p-1"
          />
        </div>
      </div>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button size="icon" variant="ghost">
        <List className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Indent className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Outdent className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button size="icon" variant="ghost">
        <Undo className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Redo className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="mx-1 h-8" />
      
      <Button size="icon" variant="ghost">
        <Link className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Image className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Code className="h-4 w-4" />
      </Button>
    </div>
  );
} 