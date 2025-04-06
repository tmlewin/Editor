"use client";

import { applySyntaxHighlighting, fixLinks } from "@/utils/editorUtils";

interface EditorPreviewProps {
  content: string;
  enableSyntaxHighlighting: boolean;
}

export default function EditorPreview({
  content,
  enableSyntaxHighlighting,
}: EditorPreviewProps) {
  // Determine if content appears to be code for syntax highlighting
  const shouldApplySyntaxHighlighting = () => {
    if (!enableSyntaxHighlighting) return false;

    // Check if content contains code indicators
    const hasCodeIndicators = /\b(function|class|import|export|const|let|var|if|else|for|while|return|public|private|def|fn|func)\b/.test(content);
    return hasCodeIndicators;
  };

  // Store the processed content in a variable to avoid duplicate processing
  // First fix any links, then apply syntax highlighting if needed
  const fixedContent = fixLinks(content);
  const processedContent = enableSyntaxHighlighting
    ? applySyntaxHighlighting(fixedContent)
    : fixedContent;

  return (
    <div
      className={`preview-content border rounded p-4 h-full overflow-auto ${shouldApplySyntaxHighlighting() ? 'syntax-highlighted' : ''}`}
      dangerouslySetInnerHTML={{
        __html: processedContent
      }}
    />
  );
}