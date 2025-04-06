// Helper functions for the editor

/**
 * Get the parent block element of a node
 */
export const getParentBlockElement = (node: Node): HTMLElement | null => {
  // Block elements we're interested in
  const blockElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'BLOCKQUOTE', 'PRE'];

  // Traverse up the DOM tree to find a block element
  let currentNode: Node | null = node;
  while (currentNode && currentNode.nodeType !== Node.DOCUMENT_NODE) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement;
      if (blockElements.includes(element.tagName)) {
        return element;
      }
    }
    currentNode = currentNode.parentNode;
  }

  return null;
};

/**
 * Apply syntax highlighting to content
 * Enhanced to support more languages and improved patterns
 * Modified to preserve HTML formatting tags
 */
export const applySyntaxHighlighting = (content: string): string => {
  // First, preserve HTML formatting tags by replacing them with placeholders
  // This ensures that formatting like bold, italic, etc. is preserved
  const preservedTags: {[key: string]: string} = {};
  let tagCounter = 0;

  // Function to create a unique placeholder for HTML tags
  const createPlaceholder = () => `__HTML_TAG_${tagCounter++}__`;

  // Replace HTML formatting tags with placeholders
  let processedContent = content.replace(/<\/?(?:b|strong|i|em|u|strike|sup|sub|mark|h[1-6]|p|div|span|ul|ol|li|blockquote|pre|code|a|font)(?:\s+[^>]*)?>/gi, (match) => {
    const placeholder = createPlaceholder();
    preservedTags[placeholder] = match;
    return placeholder;
  });

  // Now escape remaining HTML entities
  processedContent = processedContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Detect if content appears to be code
  const hasCodeIndicators = /\b(function|class|import|export|const|let|var|if|else|for|while|return|public|private|def|fn|func)\b/.test(processedContent);

  // Only apply syntax highlighting if content appears to be code
  if (hasCodeIndicators) {
    // Apply syntax highlighting with more comprehensive rules
    processedContent = processedContent
      // HTML/XML tags
      .replace(/&lt;(\/?[a-zA-Z0-9_:-]+)(?:\s+[^&>]+)*&gt;/g, '<span class="syntax-tag">&lt;$1&gt;</span>')

      // HTML/XML attributes
      .replace(/(\s+)([a-zA-Z0-9_:-]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)')/g, '$1<span class="syntax-attr">$2</span>$3"<span class="syntax-string">$4$5</span>"')

      // JavaScript/TypeScript keywords
      .replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|interface|type|extends|implements|import|export|from|as|default|async|await|try|catch|finally|throw|new|this|super|static|public|private|protected|readonly|typeof|instanceof|in|of|null|undefined|true|false|void|yield)\b/g, '<span class="syntax-keyword">$1</span>')

      // Python keywords
      .replace(/\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|raise|assert|pass|break|continue|global|nonlocal|lambda|True|False|None)\b/g, '<span class="syntax-keyword">$1</span>')

      // Rust keywords
      .replace(/\b(fn|let|mut|const|if|else|match|for|while|loop|break|continue|struct|enum|trait|impl|pub|use|mod|crate|self|Self|super|where|async|await|move|static|unsafe|type|ref|true|false)\b/g, '<span class="syntax-keyword">$1</span>')

      // Go keywords
      .replace(/\b(func|var|const|type|struct|interface|map|chan|package|import|if|else|for|range|switch|case|default|break|continue|return|go|defer|select|make|new|true|false|nil)\b/g, '<span class="syntax-keyword">$1</span>')

      // Strings - handle multiline strings better
      .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/gs, '<span class="syntax-string">$1</span>')

      // Numbers - more comprehensive pattern
      .replace(/\b(0[xX][0-9a-fA-F]+|0[oO][0-7]+|0[bB][01]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span class="syntax-number">$1</span>')

      // Comments - handle multiline comments better
      .replace(/(\/\/.*?$|\/\*[\s\S]*?\*\/|#.*?$)/gm, '<span class="syntax-comment">$1</span>')

      // Function calls
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '<span class="syntax-function">$1</span>(')

      // Decorators/Annotations (Python, Java, TypeScript)
      .replace(/(@[a-zA-Z_$][a-zA-Z0-9_$]*)/g, '<span class="syntax-decorator">$1</span>');
  }

  // Restore the preserved HTML tags
  Object.keys(preservedTags).forEach(placeholder => {
    processedContent = processedContent.replace(placeholder, preservedTags[placeholder]);
  });

  return processedContent;
};

/**
 * Remove syntax highlighting spans from content
 * This is used when toggling syntax highlighting off
 */
export const removeSyntaxHighlighting = (content: string): string => {
  // Create a temporary div to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Find all syntax highlighting spans
  const syntaxSpans = tempDiv.querySelectorAll(
    '.syntax-tag, .syntax-keyword, .syntax-string, .syntax-number, ' +
    '.syntax-comment, .syntax-function, .syntax-decorator, .syntax-attr'
  );

  // Replace each span with its text content
  syntaxSpans.forEach(span => {
    const textContent = span.textContent || '';
    const textNode = document.createTextNode(textContent);
    span.parentNode?.replaceChild(textNode, span);
  });

  // Return the cleaned HTML
  return tempDiv.innerHTML;
};

/**
 * Fix links in content to ensure they have proper protocols
 * This prevents links from being treated as relative URLs
 */
export const fixLinks = (content: string): string => {
  // Create a temporary div to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Find all anchor tags
  const links = tempDiv.querySelectorAll('a');

  // Fix each link that doesn't have a protocol
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !/^https?:\/\//i.test(href) && !href.startsWith('/') && !href.startsWith('#')) {
      // Add https:// to links that don't have a protocol and aren't relative
      link.setAttribute('href', 'https://' + href);
    }

    // Add target="_blank" to open links in a new tab
    if (href && (href.startsWith('http://') || href.startsWith('https://') ||
        (!href.startsWith('/') && !href.startsWith('#')))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Return the fixed HTML
  return fixImages(tempDiv.innerHTML);
};

/**
 * Fix images in content to make them cursor-friendly
 * This ensures that the cursor can be positioned next to images
 */
export const fixImages = (content: string): string => {
  // Create a temporary div to manipulate the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;

  // Find all images
  const images = tempDiv.querySelectorAll('img');

  // Process each image
  images.forEach(img => {
    // Make sure the image is contenteditable="false"
    img.setAttribute('contenteditable', 'false');

    // Check if the image is inside a span that makes it non-cursor-friendly
    const parent = img.parentElement;
    if (parent && parent.tagName === 'SPAN' && parent.getAttribute('contenteditable') === 'false') {
      // Get the alignment from the span style
      const style = parent.getAttribute('style') || '';
      let alignment = 'left';

      if (style.includes('center') || style.includes('text-align: center')) {
        alignment = 'center';
      } else if (style.includes('right') || style.includes('text-align: right')) {
        alignment = 'right';
      }

      // Create a new image with the appropriate alignment
      const newImg = img.cloneNode(true) as HTMLImageElement;

      if (alignment === 'center') {
        // For center alignment, use a div with text-align: center
        const div = document.createElement('div');
        div.setAttribute('style', 'text-align: center; margin: 10px 0; clear: both;');
        div.appendChild(newImg);

        // Replace the span with the div
        parent.parentNode?.replaceChild(div, parent);

        // Add a paragraph after for better cursor positioning
        const p = document.createElement('p');
        if (div.nextSibling) {
          div.parentNode?.insertBefore(p, div.nextSibling);
        } else {
          div.parentNode?.appendChild(p);
        }
      } else if (alignment === 'right') {
        // For right alignment, use float: right
        newImg.setAttribute('style', 'float: right; margin: 10px 0 10px 10px; max-width: 100%;');

        // Replace the span with the image
        parent.parentNode?.replaceChild(newImg, parent);
      } else {
        // For left alignment, use float: left
        newImg.setAttribute('style', 'float: left; margin: 10px 10px 10px 0; max-width: 100%;');

        // Replace the span with the image
        parent.parentNode?.replaceChild(newImg, parent);
      }
    }
  });

  // Return the fixed HTML
  return tempDiv.innerHTML;
};

/**
 * Generate line numbers for the editor content
 */
export const generateLineNumbers = (content: string): number => {
  return content.split('\n').length || 1;
};

/**
 * Handle paste events to clean up pasted content
 */
export const cleanPastedContent = (clipboardData: DataTransfer): string => {
  // Get the clipboard data
  let pastedData = clipboardData.getData('text/html') || clipboardData.getData('text');

  // If we have HTML content, clean it
  if (clipboardData.types.includes('text/html')) {
    // Create a temporary element to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pastedData;

    // Remove specific styling that causes visibility issues
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof HTMLElement) {
        // Remove color-related styling
        el.style.removeProperty('color');
        el.style.removeProperty('background-color');

        // Remove color-related attributes
        el.removeAttribute('color');

        // Remove any classes that might affect color
        el.className = el.className
          .split(' ')
          .filter(cls => !cls.includes('text-') && !cls.includes('bg-') && !cls.includes('color'))
          .join(' ');
      }
    });

    // Fix links in the pasted content
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !/^https?:\/\//i.test(href) && !href.startsWith('/') && !href.startsWith('#')) {
        // Add https:// to links that don't have a protocol and aren't relative
        link.setAttribute('href', 'https://' + href);
      }

      // Add target="_blank" to open links in a new tab
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Get the cleaned HTML
    pastedData = tempDiv.innerHTML;
  }

  return pastedData;
};