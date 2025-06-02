/**
 * PDF Generator Utility
 * Generates a printable HTML document for PDF export
 */

/**
 * Generate a printable HTML document for PDF export
 * @param {Object} params - PDF generation parameters
 * @param {string} params.paperTitle - Title of the paper
 * @param {Array<string>} params.header - Header lines
 * @param {string} params.instructions - Instructions text
 * @param {Array<Object>} params.questions - Array of question objects
 * @param {Array<string>} params.footer - Footer lines
 * @param {Object} params.watermark - Watermark settings
 * @returns {Window} - The opened print window
 */
const escapeHTML = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"\/]/g, function (match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }[match];
  });
};

export const generatePDF = ({
  paperTitle,
  header,
  instructions,
  questions,
  footer,
  watermark,
  answerKeyDisplayMode,
  fontSize,
  fontWeight,
  fontColor
}) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${paperTitle}</title>
      <!-- KaTeX CSS link can be included here or managed by GeneratedPdfPage.jsx -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css">
      <!-- KaTeX JS will be loaded by GeneratedPdfPage.jsx -->
      <style>
        body {
          font-size: ${fontSize}px;
          font-weight: ${fontWeight};
          color: ${fontColor};
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          margin: 15px;
          /* font-size, font-weight, and color are now set dynamically */
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          column-span: all;
        }
        .title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .instructions {
          margin-bottom: 25px;
          padding: 12px;
          background-color: #f8f8f8;
          border-left: 3px solid #333;
          column-span: all;
        }
        .instructions h3 {
          margin-top: 0;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .instructions pre {
          margin: 0;
          font-size: 11px;
          line-height: 1.3;
        }
        
        /* Two Column Layout */
        .questions-container {
          column-count: 2;
          column-gap: 25px;
          column-rule: 1px solid #ddd;
        }
        
        .question {
          margin-bottom: 20px;
          page-break-inside: avoid;
          break-inside: avoid;
          display: inline-block;
          width: 100%;
        }
        .question-header {
          font-weight: bold;
          margin-bottom: 8px;
          font-size: 13px;
          color: #333;
        }
        .question-content {
          margin-bottom: 10px;
          padding-left: 12px;
        }
        .question-image {
          max-width: 100%;
          height: auto;
          margin: 8px 0;
          display: block;
        }
        .options {
          margin-left: 12px;
        }
        .option {
          margin-bottom: 6px;
          display: flex;
          align-items: flex-start;
          gap: 6px;
          line-height: 1.3;
        }
        .option-label {
          font-weight: bold;
          min-width: 18px;
          font-size: 11px;
        }
        .option-content {
          flex: 1;
          font-size: 11px;
        }
        .option-image {
          max-width: 150px;
          height: auto;
          margin-top: 3px;
          display: block;
        }
        
        /* KaTeX Styling for 2-column layout */
        .katex {
          font-size: 1em;
        }
        .katex-display {
          margin: 8px 0;
          font-size: 0.95em;
        }
        
        /* Watermark styles */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(0, 0, 0, 0.1);
          z-index: -1;
          font-weight: bold;
          white-space: nowrap;
          pointer-events: none;
        }
        
        /* Header and Footer styles */
        .header-line {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        /* Fixed footer at bottom of every page */
        .footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #666;
          background: white;
          z-index: 1000;
          padding: 10px 0;
          border-top: 1px solid #ddd;
        }
        
        /* Add bottom margin to content to avoid footer overlap */
        .questions-container {
          margin-bottom: 80px;
        }
        
        /* Print-specific styles */
        @media print {
          @page {
            /* Set reasonable margins for content */
            margin-top: 0.75in;
            margin-bottom: 0.75in; /* Ensure space for custom footer and page number */
            margin-left: 0.5in;
            margin-right: 0.5in;

            /* Attempt to clear browser default headers */
            @top-left { content: ""; }
            @top-center { content: ""; }
            @top-right { content: ""; }
            /* @bottom-left, @bottom-center, @bottom-right are not touched here
               to allow custom footer and page numbering to work as intended.
               Page numbering uses @bottom-center specifically. */
          }

          body { 
            margin: 0; /* Content will now be spaced by @page margins */
            /* font-size is now set dynamically, consider if print specific size is needed or inherit from body */
          }

          .questions-container {
            column-gap: 20px;
            margin-bottom: 60px; /* Ensure space for the fixed footer */
          }

          .question { 
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .header, .instructions {
            column-span: all;
          }

          .watermark {
            display: block;
          }

          .footer {
            position: fixed;
            bottom: 15px; /* Adjust if needed based on @page margin-bottom */
            left: 15px;
            right: 15px;
            font-size: 10px;
            background: transparent; /* Or white if preferred */
            border-top: 1px solid #ccc;
            padding: 8px 0;
            /* Ensure it's above other content if z-index issues arise, though usually not needed with @page */
          }
        }
        
        /* Watermark styles (This is a general style, ensure it doesn't conflict with print version if different behavior is needed) */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(0, 0, 0, 0.1);
          z-index: -1;
          font-weight: bold;
          white-space: nowrap;
          pointer-events: none;
        }
        
        /* Header and Footer styles */
        .header-line {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
        }
        
        /* Fixed footer at bottom of every page */
        .footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #666;
          background: white;
          z-index: 1000;
          padding: 10px 0;
          border-top: 1px solid #ddd;
        }
        
        /* Add bottom margin to content to avoid footer overlap */
        .questions-container {
          margin-bottom: 80px;
        }
        
        /* Print-specific footer styles */
        @media print {
          .footer {
            position: fixed;
            bottom: 15px;
            left: 15px;
            right: 15px;
            font-size: 10px;
            background: transparent;
            border-top: 1px solid #ccc;
            padding: 8px 0;
          }
          
          .questions-container {
            margin-bottom: 60px;
          }
          
          /* Ensure footer appears on every printed page */
          @page {
            margin-bottom: 60px;
          }
        }
        
        /* Handle single column on small content */
        @media (max-width: 600px) {
          .questions-container {
            column-count: 1;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${paperTitle}</div>
        ${header.length > 0 ? header.map(h => `<div class="header-line">${h}</div>`).join('') : ''}
      </div>
      
      <div class="instructions">
        <h3>Instructions:</h3>
        <pre>${instructions}</pre>
      </div>

      ${watermark.enabled ? `<div class="watermark">${watermark.text}</div>` : ''}

      <div class="questions-container">
      ${questions.map((question, index) => `
        <div class="question">
          <div class="question-header">
            Question ${index + 1}:
          </div>
          <div class="question-content">
            <div id="question-${question.id}-text">${escapeHTML(question.questionText)}</div>
            ${question.questionImage ? `<img src="${question.questionImage}" class="question-image" alt="Question ${index + 1} Image">` : ''}
          </div>
          <div class="options">
            ${question.options.map((option, optIndex) => `
              <div class="option">
                <div class="option-label">${String.fromCharCode(65 + optIndex)})</div>
                <div class="option-content">
                  <div id="option-${question.id}-${optIndex}">${escapeHTML(option.text)}</div>
                  ${option.image ? `<img src="${option.image}" class="option-image" alt="Option ${String.fromCharCode(65 + optIndex)} Image">` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      </div>

      </div>

      ${answerKeyDisplayMode !== 'NONE' ? `
      <div style="page-break-before: always;"></div>
      <div class="answer-key-container">
        <h2 style="text-align:center; font-size: 20px; margin-bottom: 20px;">Answer Key ${answerKeyDisplayMode === 'KEY_AND_EXPLANATION' ? '& Explanations' : ''}</h2>
        ${questions.map((q, index) => `
          <div class="answer-item" style="margin-bottom: 15px; page-break-inside: avoid;">
            <div style="font-weight: bold;">${index + 1}. Correct Answer: ${String.fromCharCode(65 + q.options.findIndex(opt => opt.text === q.correctAnswer || String.fromCharCode(65 + q.options.indexOf(opt)) === q.correctAnswer )) /* Handle both text and index based correct answer */}</div>
            ${answerKeyDisplayMode === 'KEY_AND_EXPLANATION' && q.explanation ? `<div style="margin-top: 5px; padding-left: 15px;" id="explanation-${q.id}">${escapeHTML(q.explanation)}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${footer.length > 0 ? `<div class="footer">${footer.map(f => `<div>${f}</div>`).join('')}</div>` : ''}

    </body>
    </html>
  `;

  return htmlContent;

};