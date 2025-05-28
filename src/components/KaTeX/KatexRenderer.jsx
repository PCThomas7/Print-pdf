import React, { useState, useRef, useEffect } from 'react';

/**
 * KatexRenderer Component
 * Renders mathematical expressions using KaTeX library
 */
const KatexRenderer = ({ text, displayMode = false, className = '' }) => {
  const containerRef = useRef(null);
  const [renderedHTML, setRenderedHTML] = useState('');
  const [error, setError] = useState('');
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Simple text line break processor
  const processTextLineBreaks = (text) => {
    if (typeof text !== 'string') return '';
    return text.replace(/\\\\/g, '<br/>');
  };

  // Load KaTeX from CDN
  useEffect(() => {
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css';
    document.head.appendChild(link);
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js';
    script.async = true;
    script.onload = () => {
      setKatexLoaded(true);
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (katexLoaded) {
      renderKaTeX(text);
    }
  }, [text, displayMode, katexLoaded]);

  // Parse text into segments of text and math
  const parseTextAndMath = (text) => {
    const segments = [];
    let currentIndex = 0;
    let inMath = false;
    let inDisplayMath = false;
    let mathStartIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '\\' && i + 1 < text.length && text[i + 1] === '$') {
        i++;
        continue;
      }
      
      if (i + 1 < text.length && text[i] === '$' && text[i + 1] === '$') {
        if (!inMath && !inDisplayMath) {
          if (i > currentIndex) {
            segments.push({
              type: 'text',
              content: text.substring(currentIndex, i)
            });
          }
          inDisplayMath = true;
          mathStartIndex = i + 2;
          i++;
        } else if (inDisplayMath) {
          segments.push({
            type: 'math',
            displayMode: true,
            content: text.substring(mathStartIndex, i)
          });
          inDisplayMath = false;
          currentIndex = i + 2;
          i++;
        }
      } else if (text[i] === '$') {
        if (!inMath && !inDisplayMath) {
          if (i > currentIndex) {
            segments.push({
              type: 'text',
              content: text.substring(currentIndex, i)
            });
          }
          inMath = true;
          mathStartIndex = i + 1;
        } else if (inMath) {
          segments.push({
            type: 'math',
            displayMode: false,
            content: text.substring(mathStartIndex, i)
          });
          inMath = false;
          currentIndex = i + 1;
        }
      }
    }
    
    if (currentIndex < text.length) {
      if (inMath) {
        segments.push({
          type: 'text',
          content: '$' + text.substring(mathStartIndex)
        });
      } else if (inDisplayMath) {
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
    
    if ((segments.length === 0 || (segments.length === 1 && segments[0].type === 'text')) && !displayMode) {
      const textContent = segments.length === 1 ? segments[0].content : text;
      const hasActualMathSymbols = /(?:\\[a-zA-Z]+(?![a-zA-Z])(?!\\))|[${}^_]/.test(textContent);
      const onlyHasLineBreaks = !hasActualMathSymbols && /\\\\/.test(textContent);
      
      if (hasActualMathSymbols && !onlyHasLineBreaks) {
        return [{ type: 'math', displayMode: false, content: text }];
      }
      
      return segments.length === 0 ? [{ type: 'text', content: text }] : segments;
    }
    
    return segments;
  };

  // Convert tabular to array
  const convertTabularToArray = (text) => {
    if (typeof text !== 'string') return '';
    const tabularRegex = /\\begin\{tabular\}(\{[^}]*\})([\s\S]*?)\\end\{tabular\}/g;
    
    return text.replace(tabularRegex, (match, columnSpec, content) => {
      const rows = content.trim().split(/\\\\\s*/);
      const processedRows = [];
      
      for (let row of rows) {
        if (!row.trim()) continue;
        
        if (row.trim() === '\\hline') {
          processedRows.push('\\hline');
          continue;
        }
        
        const cells = row.split('&');
        const processedCells = [];
        
        for (let cell of cells) {
          cell = cell.trim();
          
          if (cell.match(/^\$.*\$$/)) {
            processedCells.push(cell.substring(1, cell.length - 1));
          } else if (cell.match(/\$/)) {
            processedCells.push(cell.replace(/\$(.*?)\$/g, '$1'));
          } else if (cell && !cell.match(/^\\/) && !cell.match(/^\s*$/)) {
            processedCells.push(`\\text{${cell}}`);
          } else {
            processedCells.push(cell);
          }
        }
        
        processedRows.push(processedCells.join(' & '));
      }
      
      const processedContent = processedRows.join(' \\\\ ');
      return `\\begin{array}${columnSpec}${processedContent}\\end{array}`;
    });
  };

  const renderKaTeX = (text) => {
    if (typeof text !== 'string') {
      // If text is not a string, set renderedHTML to empty and clear errors
      // This handles cases where props like header/footer might be arrays initially
      setRenderedHTML('');
      setError('');
      return;
    }
    if (!window.katex) {
      setError('KaTeX library is still loading...');
      return;
    }
    
    try {
      const processedText = convertTabularToArray(text);
      
      if (displayMode) {
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
        const segments = parseTextAndMath(processedText);
        let html = '';
        
        for (const segment of segments) {
          if (segment.type === 'text') {
            const textContent = processTextLineBreaks(segment.content);
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
      {error && <div className="katex-error text-red-600 text-sm">{error}</div>}
      <div 
        ref={containerRef} 
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
        className="katex-content"
        style={{
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap',
          wordSpacing: 'normal',
          wordBreak: 'break-word',
          fontWeight: '600'
        }}
      />
    </div>
  );
};

export default KatexRenderer;