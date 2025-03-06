"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorAreaProps {
  text: string;
  setText?: (text: string) => void;
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
  viewMode: "edit" | "preview";
  fullWidth?: boolean;
}

export default function EditorArea({
  text,
  setText,
  formatting,
  viewMode,
  fullWidth = false
}: EditorAreaProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = text;
    }
  }, [text]);

  const formatClasses = cn(
    "min-h-[300px] w-full p-4 rounded-md border",
    formatting.bold && "font-bold",
    formatting.italic && "italic",
    formatting.underline && "underline",
    formatting.strikethrough && "line-through",
    {
      "text-left": formatting.align === "left",
      "text-center": formatting.align === "center",
      "text-right": formatting.align === "right",
      "text-justify": formatting.align === "justify",
    }
  );

  const headingStyles = () => {
    switch (formatting.heading) {
      case "h1":
        return "text-3xl font-bold";
      case "h2":
        return "text-2xl font-bold";
      default:
        return "";
    }
  };

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <div className="mb-2">
        <h2 className="text-sm font-medium">
          {viewMode === "edit" ? "Your Document Text" : "Formatted Text"}
        </h2>
      </div>
      
      {viewMode === "edit" ? (
        <textarea
          className={formatClasses}
          style={{
            color: formatting.textColor,
            backgroundColor: formatting.bgColor !== "transparent" ? formatting.bgColor : "",
          }}
          value={text}
          onChange={(e) => setText && setText(e.target.value)}
          placeholder="Start typing here..."
        />
      ) : (
        <div
          ref={previewRef}
          className={cn(
            formatClasses,
            "bg-secondary/20",
            headingStyles()
          )}
          style={{
            color: formatting.textColor,
            backgroundColor: formatting.bgColor !== "transparent" ? formatting.bgColor : "",
          }}
        />
      )}
    </div>
  );
} 