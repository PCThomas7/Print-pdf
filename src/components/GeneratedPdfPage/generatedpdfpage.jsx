import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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

    const renderMathContent = (text, displayMode = false) => {
      if (!text || typeof text !== 'string' || !window.katex) return text;
      try {
        // First, handle escaped HTML entities that might be part of the original text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = text;
        let decodedText = tempDiv.textContent || tempDiv.innerText || "";

        // Replace escaped dollar signs if they were used to represent literal dollars
        // This step might need adjustment based on how literal dollars are input vs. math delimiters
        // For now, assuming \$ is for literal and $...$ for math
        decodedText = decodedText.replace(/\\\$/g, '\$'); // Convert \\$ to \$

        // Handle display math $$...$$
        decodedText = decodedText.replace(/\$\$(.*?)\$\$/g, (match, math) => {
          try {
            return window.katex.renderToString(math, { displayMode: true, throwOnError: false });
          } catch (e) {
            console.warn('KaTeX display math error:', e, 'for content:', math);
            return match; // Return original on error
          }
        });

        // Handle inline math $...$
        decodedText = decodedText.replace(/\$(?!\$)(.*?)(?<!\$)\$/g, (match, math) => {
          // Avoid matching already processed display math or escaped dollars
          if (match.startsWith('$$') || match.endsWith('$$')) return match;
          try {
            return window.katex.renderToString(math, { displayMode: false, throwOnError: false });
          } catch (e) {
            console.warn('KaTeX inline math error:', e, 'for content:', math);
            return match; // Return original on error
          }
        });
        
        // Handle line breaks specifically for KaTeX, if \\ is used and not escaped
        // The pdfGenerator already replaces \\\\ with <br/>, so this might be redundant
        // or needs to be coordinated. For now, assuming <br/> is handled by HTML.
        // decodedText = decodedText.replace(/\\\\/g, '<br/>'); 

        return decodedText;
      } catch (e) {
        console.error('Error in renderMathContent:', e, 'for text:', text);
        return text; // Return original text on error
      }
    };

    const renderMathInHtml = () => {
      if (!window.katex || !questions) return;

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
    // Then load KaTeX and render math
    loadKaTeX();

  }, [htmlContent, questions, answerKeyDisplayMode]);

  if (!htmlContent) {
    return <p>No PDF content available. Please generate a PDF first.</p>;
  }

  // Use a ref to manipulate the content, so React doesn't interfere with direct DOM manipulation for KaTeX
  return <div ref={contentRef} />;
};

export default GeneratedPdfPage;