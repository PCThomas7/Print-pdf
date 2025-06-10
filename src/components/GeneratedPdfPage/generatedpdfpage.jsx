import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import KatexRenderer from '../KaTeX/KatexRenderer';

const GeneratedPdfPage = () => {
  const location = useLocation();
  const { htmlContent, questions, answerKeyDisplayMode } = location.state || {};
  const contentRef = useRef(null);

  useEffect(() => {
    if (!htmlContent || !contentRef.current) return;

    const loadKaTeX = () => {
      if (window.katex) {
        renderMathInHtml();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js';
      script.async = true;
      script.onload = () => {
        renderMathInHtml();
      };
      script.onerror = () => {
        console.error('Failed to load KaTeX script.');
        // Fallback or error handling if KaTeX doesn't load
        // For now, just attempt to print
        triggerPrint(); 
      };
      document.body.appendChild(script);

      // Optional: Add KaTeX CSS if not already in htmlContent's head
      if (!document.querySelector('link[href*="katex.min.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css';
        document.head.appendChild(link);
      }
    };

    // Use KatexRenderer component to render math content
    const renderMathContent = (text, displayMode = false) => {
      if (!text || typeof text !== 'string') return text;
      
      // Create a temporary div to render the KatexRenderer component
      const tempDiv = document.createElement('div');
      
      // Use ReactDOM to render the KatexRenderer component to the temporary div
      // Since we're in a useEffect hook, we can't use JSX directly
      // Instead, we'll use the rendered HTML from the KatexRenderer component's logic
      
      // First, handle escaped HTML entities that might be part of the original text
      const decodingDiv = document.createElement('div');
      decodingDiv.innerHTML = text;
      let decodedText = decodingDiv.textContent || decodingDiv.innerText || "";
      
      // Replace escaped dollar signs if they were used to represent literal dollars
      decodedText = decodedText.replace(/\\\$/g, '\$'); // Convert \\$ to \$
      
      // Use the same logic as KatexRenderer component
      try {
        if (!window.katex) {
          console.warn('KaTeX library not loaded yet');
          return text;
        }
        
        // Process tabular to array conversion (from KatexRenderer)
        const processTabular = (text) => {
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
        
        // Parse text into segments of text and math (from KatexRenderer)
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
        
        // Process text line breaks
        const processTextLineBreaks = (text) => {
          if (typeof text !== 'string') return '';
          return text.replace(/\\\\/g, '<br/>');
        };
        
        const processedText = processTabular(decodedText);
        
        if (displayMode) {
          const html = window.katex.renderToString(processedText, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#f44336',
            trust: true,
            strict: "ignore",
          });
          return html;
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
                console.warn('KaTeX math error:', mathError.message, 'for content:', segment.content);
                html += `<span style="color: #f44336;">${segment.content}</span>`;
              }
            }
          }
          
          return html;
        }
      } catch (e) {
        console.error('Error in renderMathContent:', e, 'for text:', text);
        return text; // Return original text on error
      }
    };

    const renderMathInHtml = () => {
      if (!window.katex) return;

      // First, find all katex-content tags and process them
      const katexContentElements = contentRef.current.querySelectorAll('katex-content');
      if (katexContentElements.length > 0) {
        console.log(`Found ${katexContentElements.length} katex-content elements`);
        katexContentElements.forEach(element => {
          const originalText = element.textContent;
          element.innerHTML = renderMathContent(originalText);
        });
      } else {
        console.log('No katex-content elements found, falling back to direct rendering');
        // Fallback to direct rendering if no katex-content tags are found
        if (questions) {
          questions.forEach(question => {
            const questionTextEl = contentRef.current.querySelector(`#question-${question.id}-text`);
            if (questionTextEl && question.questionText) {
              questionTextEl.innerHTML = renderMathContent(question.questionText);
            }

            question.options.forEach((option, optIndex) => {
              const optionTextEl = contentRef.current.querySelector(`#option-${question.id}-${optIndex}`);
              if (optionTextEl && option.text) {
                optionTextEl.innerHTML = renderMathContent(option.text);
              }
            });

            if (answerKeyDisplayMode === 'KEY_AND_EXPLANATION' && question.explanation) {
              const explanationEl = contentRef.current.querySelector(`#explanation-${question.id}`);
              if (explanationEl) {
                explanationEl.innerHTML = '<strong>Explanation:</strong> ' + renderMathContent(question.explanation);
              }
            }
          });
        }
      }
      triggerPrint();
    };

    const triggerPrint = () => {
      // Delay print to allow KaTeX to render and DOM to update
      setTimeout(() => {
        window.print();
      }, 1000); // Adjust delay as needed
    };

    // Set the initial HTML content
    contentRef.current.innerHTML = htmlContent;
    
    // Hide URLs in any dynamically added links
    const hideUrls = () => {
      const links = contentRef.current.querySelectorAll('a');
      links.forEach(link => {
        link.style.pointerEvents = 'none';
        link.style.cursor = 'default';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';
        // Prevent showing URL in status bar
        link.addEventListener('mouseover', (e) => {
          e.preventDefault();
          window.status = '';
          return true;
        });
      });
    };
    
    // Apply URL hiding after content is set
    hideUrls();
    
    // Then load KaTeX and render math
    loadKaTeX();
    
    // Apply URL hiding again after KaTeX rendering
    setTimeout(hideUrls, 500);

  }, [htmlContent, questions, answerKeyDisplayMode]);

  if (!htmlContent) {
    return <p>No PDF content available. Please generate a PDF first.</p>;
  }

  // Use a ref to manipulate the content, so React doesn't interfere with direct DOM manipulation for KaTeX
  return <div ref={contentRef} />;
};

export default GeneratedPdfPage;