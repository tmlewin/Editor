/**
 * Applies syntax highlighting to HTML content
 * @param content The HTML content to highlight
 * @returns Highlighted HTML content
 */
export const applySyntaxHighlighting = (content: string): string => {
  // Escape HTML entities first
  let processedContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting with comprehensive rules
  processedContent = processedContent
    // HTML tags
    .replace(/&lt;(\/?[a-zA-Z0-9]+)(?:\s+[^&>]+)*&gt;/g, '<span class="syntax-tag">&lt;$1&gt;</span>')
    // JavaScript keywords
    .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|null|undefined|true|false)\b/g, '<span class="syntax-keyword">$1</span>')
    // Strings
    .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="syntax-string">$1</span>')
    // Numbers
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="syntax-number">$1</span>')
    // Comments
    .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="syntax-comment">$1</span>');

  return processedContent;
}; 