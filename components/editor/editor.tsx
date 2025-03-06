"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Toolbar from "@/components/editor/toolbar/toolbar";
import EditorArea from "@/components/editor/editor-area";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

export default function Editor() {
  const [text, setText] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: "left",
    heading: "",
    textColor: "#000000",
    bgColor: "transparent"
  });

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  };

  return (
    <div className={`border rounded-lg shadow-sm overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className="p-2 flex justify-between items-center border-b">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={toggleFullScreen}
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <Toolbar formatting={formatting} setFormatting={setFormatting} />
      
      <Tabs defaultValue="edit" className="w-full">
        <TabsContent value="edit" className="mt-0">
          <div className="grid grid-cols-2 gap-4 p-4">
            <EditorArea 
              text={text} 
              setText={setText} 
              formatting={formatting}
              viewMode="edit"
            />
            <EditorArea 
              text={text}
              formatting={formatting}
              viewMode="preview"
            />
          </div>
        </TabsContent>
        <TabsContent value="preview" className="mt-0 p-4">
          <EditorArea 
            text={text}
            formatting={formatting}
            viewMode="preview"
            fullWidth
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 