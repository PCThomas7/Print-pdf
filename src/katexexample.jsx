import React, { useEffect, useRef } from 'react';

// Simple text line break processor
const processTextLineBreaks = (text: string) => {
  return text.replace(/\\\\/g, '<br/>');
};

interface KatexRenderedProps {
  /**
   * The KaTeX/LaTeX text to render
   */
  content: string;
  /**
   * If true, the entire content is treated as math
   * If false, $ and $$ delimiters are used to identify math within text
   */
  displayMode?: boolean;
  /**
   * Additional className for the rendered container
   */
  className?: string;
}

/**
 * A component that renders KaTeX content as HTML
 */
const KatexRendered: React.FC<KatexRenderedProps> = ({ 
  content, 
  displayMode = false, 
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedHTML, setRenderedHTML] = React.useState('');
  const [error, setError] = React.useState('');
  const [katexLoaded, setKatexLoaded] = React.useState(false);

  // Load KaTeX from CDN
  useEffect(() => {
    // Check if KaTeX is already loaded
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }
    
    // Create link for KaTeX CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css';
    document.head.appendChild(link);
    
    // Create script for KaTeX JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js';
    script.async = true;
    script.onload = () => {
      setKatexLoaded(true);
    };
    document.body.appendChild(script);
    
    // Cleanup function to remove the elements when component unmounts
    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (katexLoaded) {
      renderKaTeX(content);
    }
  }, [content, displayMode, katexLoaded]);

  // Parse text into segments of text and math
  const parseTextAndMath = (text: string) => {
    const segments = [];
    let currentIndex = 0;
    let inMath = false;
    let inDisplayMath = false;
    let mathStartIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      // Handle escaped dollar sign
      if (text[i] === '\\' && i + 1 < text.length && text[i + 1] === '$') {
        i++; // Skip the backslash
        continue;
      }
      
      // Check for display math ($$)
      if (i + 1 < text.length && text[i] === '$' && text[i + 1] === '$') {
        if (!inMath && !inDisplayMath) {
          // Start of display math
          if (i > currentIndex) {
            segments.push({
              type: 'text',
              content: text.substring(currentIndex, i)
            });
          }
          inDisplayMath = true;
          mathStartIndex = i + 2; // Skip both dollar signs
          i++; // Skip the next dollar sign
        } else if (inDisplayMath) {
          // End of display math
          segments.push({
            type: 'math',
            displayMode: true,
            content: text.substring(mathStartIndex, i)
          });
          inDisplayMath = false;
          currentIndex = i + 2; // Skip both dollar signs
          i++; // Skip the next dollar sign
        }
      }
      // Check for inline math ($)
      else if (text[i] === '$') {
        if (!inMath && !inDisplayMath) {
          // Start of inline math
          if (i > currentIndex) {
            segments.push({
              type: 'text',
              content: text.substring(currentIndex, i)
            });
          }
          inMath = true;
          mathStartIndex = i + 1; // Skip the dollar sign
        } else if (inMath) {
          // End of inline math
          segments.push({
            type: 'math',
            displayMode: false,
            content: text.substring(mathStartIndex, i)
          });
          inMath = false;
          currentIndex = i + 1; // Skip the dollar sign
        }
      }
    }
    
    // Add any remaining text
    if (currentIndex < text.length) {
      if (inMath) {
        // Unclosed math delimiter - treat as text
        segments.push({
          type: 'text',
          content: '$' + text.substring(mathStartIndex)
        });
      } else if (inDisplayMath) {
        // Unclosed display math delimiter - treat as text
        segments.push({
          type: 'text',
          content: '$$' + text.substring(mathStartIndex)
        });
      } else {
        segments.push({
          type: 'text',
          content: text.substring(currentIndex)
        });
      }
    }
    
    // If no segments or just one text segment, and displayMode is false
    if ((segments.length === 0 || (segments.length === 1 && segments[0].type === 'text')) && !displayMode) {
      // Check if it contains LaTeX math commands that would typically require math mode
      // Note: We exclude \\ which is just for line breaks in text
      const textContent = segments.length === 1 ? segments[0].content : text;
      
      // More precise detection of math content - must have actual math symbols
      // beyond just escaped backslashes for line breaks
      const hasActualMathSymbols = /(?:\\[a-zA-Z]+(?![a-zA-Z])(?!\\))|[${}^_]/.test(textContent);
      
      // Special case: Only has \\ (line breaks) or basic text - treat as pure text
      const onlyHasLineBreaks = !hasActualMathSymbols && /\\\\/.test(textContent);
      
      if (hasActualMathSymbols && !onlyHasLineBreaks) {
        return [{ type: 'math', displayMode: false, content: text }];
      }
      
      // If it's plain text or only has \\ line breaks, keep it as text
      return segments.length === 0 ? [{ type: 'text', content: text }] : segments;
    }
    
    return segments;
  };

  // Convert tabular to array (since KaTeX doesn't support tabular)
  const convertTabularToArray = (text: string) => {
    // Regex to find tabular environments
    const tabularRegex = /\\begin\{tabular\}(\{[^}]*\})([\s\S]*?)\\end\{tabular\}/g;
    
    return text.replace(tabularRegex, (match, columnSpec, content) => {
      // Process the content to handle text vs. math content appropriately
      
      // Step 1: Split the content by lines/rows
      const rows = content.trim().split(/\\\\\s*/);
      const processedRows = [];
      
      // Step 2: Process each row
      for (let row of rows) {
        // Skip empty rows
        if (!row.trim()) continue;
        
        // Handle \hline specially
        if (row.trim() === '\\hline') {
          processedRows.push('\\hline');
          continue;
        }
        
        // Split the row by & to get cells
        const cells = row.split('&');
        const processedCells = [];
        
        // Process each cell
        for (let cell of cells) {
          cell = cell.trim();
          
          // Check if cell contains math delimiters
          if (cell.match(/^\$.*\$/)) {
            // Math content - just remove the $ delimiters
            processedCells.push(cell.substring(1, cell.length - 1));
          } else if (cell.match(/\$/)) {
            // Mixed content - handle carefully
            processedCells.push(cell.replace(/\$(.*?)\$/g, '$1'));
          } else if (cell && !cell.match(/^\\/) && !cell.match(/^\s*$/)) {
            // Text content - wrap in \text{}
            processedCells.push(`\\text{${cell}}`);
          } else {
            // Other content (empty or LaTeX commands) - keep as is
            processedCells.push(cell);
          }
        }
        
        // Rejoin cells with & and add to processed rows
        processedRows.push(processedCells.join(' & '));
      }
      
      // Step 3: Rejoin rows with \\ and create array
      const processedContent = processedRows.join(' \\\\ ');
      
      return `\\begin{array}${columnSpec}${processedContent}\\end{array}`;
    });
  };

  const renderKaTeX = (text: string) => {
    if (!window.katex) {
      setError('KaTeX library is still loading...');
      return;
    }
    
    try {
      // Pre-process tabular environments
      const processedText = convertTabularToArray(text);
      
      // Check if we're in direct math mode
      if (displayMode) {
        // Render directly as math when in display mode
        const html = window.katex.renderToString(processedText, {
          displayMode: true,
          throwOnError: false,
          errorColor: '#f44336',
          trust: true,
          strict: "ignore",
        
        });
        setRenderedHTML(html);
        setError('');
      } else {
        // Mixed mode rendering - handle both text and math
        const segments = parseTextAndMath(processedText);
        let html = '';
        
        for (const segment of segments) {
          if (segment.type === 'text') {
            // Process text segment to handle line breaks and ensure proper text rendering
            const textContent = processTextLineBreaks(segment.content);
            // Directly add as HTML without KaTeX processing for plain text
            html += `<span class="plain-text">${textContent}</span>`;
          } else {
            try {
              const mathHtml = window.katex.renderToString(segment.content, {
                displayMode: segment.displayMode,
                throwOnError: false,
                errorColor: '#f44336',
                trust: true,
                strict: "ignore"
              });
              html += mathHtml;
            } catch (mathError) {
              html += `<span style="color: #f44336;">Error in math: ${mathError.message}</span>`;
            }
          }
        }
        
        setRenderedHTML(html);
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`katex-rendered ${className}`}>
      {error && <div className="katex-error text-red-600">{error}</div>}
      <div 
        ref={containerRef} 
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
        className="katex-content"
      />
      <style jsx>{`
        .plain-text {
          font-family: inherit;
          white-space: pre-wrap;
          word-spacing: normal;
          word-break: break-word;
          font-weight: 500;
        }
        
        .katex-content {
          width: 100%;
        }
        
        /* Enhance math mode rendering */
        .katex-content .katex {
          font-size: 115%; /* 15% larger than normal text */
          font-weight: 500; /* Medium weight for better visibility */
        }
        
        /* Adjust display mode math even further if needed */
        .katex-content .katex-display {
          font-size: 120%; /* 20% larger for display mode formulas */
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Add declaration for the global katex object
declare global {
  interface Window {
    katex: any;
  }
}

export default KatexRendered;