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

// Function to check if text contains KaTeX expressions
const containsKaTeX = (text) => {
  if (typeof text !== 'string') return false;
  // Check for $ or $$ delimiters, or common LaTeX commands
  return /\$|\\begin|\\end|\\frac|\\sqrt|\\sum|\\int|\\lim|\\text/.test(text);
};

// Function to prepare text for KaTeX rendering
// This will be used by GeneratedPdfPage component
const prepareForKaTeX = (text) => {
  if (typeof text !== 'string') return '';
  // Add a special marker to indicate this text should be processed by KaTeX
  return `<katex-content>${text}</katex-content>`;
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
  fontColor,
  sections,
  optionNumberingStyle = 'A)',
  useKatex = true // Add new parameter to control KaTeX rendering
}) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${paperTitle}</title>
      <meta name="referrer" content="no-referrer">
      <!-- KaTeX CSS link can be included here or managed by GeneratedPdfPage.jsx -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css">
      <!-- KaTeX JS will be loaded by GeneratedPdfPage.jsx -->
      <style>
        /* Hide URL display on hover and prevent URL copy */
        a {
          pointer-events: none;
          cursor: default;
          text-decoration: none;
          color: inherit;
        }
        /* Hide URL display in status bar */
        a[href]:after {
          content: "";
        }
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
          column-gap: 20px;
          column-rule: 1px solid #ddd;
          padding-bottom: 20px;
          column-fill: balance;
        }
        
        /* Section header styling */
        .section-header {
          column-span: none;
          margin-top: 0;
          margin-bottom: 0;
          font-size: 16px;
          font-weight: bold;
          background-color: #f0f0f0;
          padding: 3px 6px;
          border-radius: 4px;
          page-break-inside: avoid;
          break-inside: avoid;
          display: block;
        }
        .question {
          margin-bottom: 15px;
          page-break-inside: avoid;
          break-inside: avoid;
          display: inline-block;
          width: 100%;
          position: relative;
          padding-bottom: 3px;
        }
        .question-content {
          margin-bottom: 5px;
          padding-left: 8px;
        }
        .question-header {
          font-weight: bold;
          font-size: ${fontSize + 1}px;
          color: #333;
          display: inline;
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
          font-size: ${fontSize - 1}px;
        }
        .option-content {
          flex: 1;
          font-size: ${fontSize - 1}px;
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
          bottom: 5;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 11px;
          color: #666;
          background: white;
          z-index: 1000;
          padding: 5px 0;
          border-top: 1px solid #ddd;
          width: 100%;
          margin-top: 10px; /* Add margin to prevent overlap with content */
        }
        
        /* Add bottom margin to content to avoid footer overlap */
        .questions-container {
          margin-bottom: 40px; /* Reduced to prevent excessive space */
        }
        
        /* Print-specific styles */
        @media print {
          /* Hide URLs in printed output */
          a[href]:after {
            content: "" !important;
          }
          a {
            text-decoration: none !important;
          }
          @page {
            /* Set reasonable margins for content */
            margin-top: 0.50in;
            margin-bottom: 0.50in; /* Increased space for footer to prevent overlap */
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
            column-gap: 15px;
            margin-bottom: 40px;
            column-rule: 1px solid #ddd;
            padding-bottom: 15px;
          }

          .question { 
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 12px;
          }

          .section-header {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 2px;
          }

          .question-num-text {
            display: flex;
            gap: 3px;
            align-items: flex-start;
          }
        }
        .question-num-text{
           display: flex;
           gap :5px;
          }

          .header, .instructions {
            column-span: all;
          }

          .watermark {
            display: block;
          }

          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            font-size: 10px;
            background: white; /* Changed to white to ensure separation */
            border-top: 1px solid #ccc;
            padding: 5px 0;
            z-index: 2000; /* Ensure it's above column rule */
            margin-top: 15px; /* Add margin to create separation */
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
          bottom: 0;
          left: 0;
          right: 0;
          top:20;
          text-align: center;
          font-size: 11px;
          color: #666;
          background: white;
          z-index: 1000;
          padding: 0px 0;
          border-top: 1px solid #ddd;
          width: 100%;
        }

        /* Add bottom margin to content to avoid footer overlap */
        .questions-container {
          margin-bottom: 40px; /* Reduced to prevent excessive space */
        }

        /* Print-specific footer styles */
        @media print {
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            font-size: 10px;
            background: white;
            border-top: 1px solid #ccc;
            padding: 5px 0;
            z-index: 2000; /* Ensure it's above column rule */
            margin-top: 15px; /* Add margin to create separation */
          }
          
          .questions-container {
            margin-bottom: 40px; /* Increased to prevent column rule from touching footer */
            padding-bottom: 20px; /* Add padding to ensure column rule doesn't extend to footer */
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
      ${sections && sections.length > 0 ? 
        // If we have sections, render questions grouped by section
        sections.map((section, sectionIndex) => `
          ${section.name ? `<div class="section-header">${section.name}</div>` : ''}
          ${section.questions.map((question, questionIndex) => {
            let overallIndex = questionIndex;
            for (let i = 0; i < sectionIndex; i++) {
              overallIndex += sections[i].questions.length;
            }
            return `
              <div class="question">
                <div class="question-num-text">
                  <span class="question-header">${overallIndex + 1}.</span>
                  <span id="question-${question.id}-text">${useKatex && containsKaTeX(question.questionText) ? prepareForKaTeX(question.questionText) : escapeHTML(question.questionText)}</span>
                </div>
                ${question.questionImage ? `<img src="${question.questionImage}" class="question-image" alt="Question ${overallIndex + 1} Image">` : ''}
                <div class="options">
                  ${question.options.map((option, optIndex) => `
                    <div class="option">
                      <span class="option-label">${
                        optionNumberingStyle.startsWith('(') ? 
                        '(' + (optionNumberingStyle.includes('1') ? optIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + optIndex) : String.fromCharCode(65 + optIndex)) + ')' : 
                        (optionNumberingStyle.includes('1') ? optIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + optIndex) : String.fromCharCode(65 + optIndex)) + optionNumberingStyle.replace(/[A-Za-z0-9]/g, '')
                      }</span>
                      <span class="option-content">
                        <span id="option-${question.id}-${optIndex}">${useKatex && containsKaTeX(option.text) ? prepareForKaTeX(option.text) : escapeHTML(option.text)}</span>
                        ${option.image ? `<img src="${option.image}" class="option-image" alt="Option ${String.fromCharCode(65 + optIndex)} Image">` : ''}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        `).join('') 
        : 
        // If no sections, render questions as before
        questions.map((question, index) => `
          <div class="question">
            <div class="question-num-text">
              <span class="question-header">${index + 1}.</span>
              <span id="question-${question.id}-text">${useKatex && containsKaTeX(question.questionText) ? prepareForKaTeX(question.questionText) : escapeHTML(question.questionText)}</span>
            </div>
            ${question.questionImage ? `<img src="${question.questionImage}" class="question-image" alt="Question ${index + 1} Image">` : ''}
            <div class="options">
              ${question.options.map((option, optIndex) => `
                <div class="option">
                  <span class="option-label">${
                    optionNumberingStyle.startsWith('(') ? 
                    '(' + (optionNumberingStyle.includes('1') ? optIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + optIndex) : String.fromCharCode(65 + optIndex)) + ')' : 
                    (optionNumberingStyle.includes('1') ? optIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + optIndex) : String.fromCharCode(65 + optIndex)) + optionNumberingStyle.replace(/[A-Za-z0-9]/g, '')
                  }</span>
                  <span class="option-content">
                    <span id="option-${question.id}-${optIndex}">${useKatex && containsKaTeX(option.text) ? prepareForKaTeX(option.text) : escapeHTML(option.text)}</span>
                    ${option.image ? `<img src="${option.image}" class="option-image" alt="Option ${String.fromCharCode(65 + optIndex)} Image">` : ''}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')
      }
      </div>

      </div>

      ${answerKeyDisplayMode !== 'NONE' ? `
      <div style="page-break-before: always;"></div>
      <div class="answer-key-container">
        <h2 style="text-align:center; font-size: 20px; margin-bottom: 20px;">Answer Key ${answerKeyDisplayMode === 'KEY_AND_EXPLANATION' ? '& Explanations' : ''}</h2>
        ${answerKeyDisplayMode === 'KEY_ONLY' ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; width: 100%;">
            ${questions.map((q, index) => {
              const correctOptionIndex = q.options.findIndex(opt => opt.text === q.correctAnswer || String.fromCharCode(65 + q.options.indexOf(opt)) === q.correctAnswer);
              const optionLabel = optionNumberingStyle.startsWith('(') ? 
                '(' + (optionNumberingStyle.includes('1') ? correctOptionIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + correctOptionIndex) : String.fromCharCode(65 + correctOptionIndex)) + ')' : 
                (optionNumberingStyle.includes('1') ? correctOptionIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + correctOptionIndex) : String.fromCharCode(65 + correctOptionIndex)) + optionNumberingStyle.replace(/[A-Za-z0-9]/g, '');
              return `
              <div style="font-weight: bold; page-break-inside: avoid;">
                ${index + 1}. ${optionLabel}
              </div>
            `}).join('')}
          </div>
        ` : `
          ${questions.map((q, index) => {
              const correctOptionIndex = q.options.findIndex(opt => opt.text === q.correctAnswer || String.fromCharCode(65 + q.options.indexOf(opt)) === q.correctAnswer);
              const optionLabel = optionNumberingStyle.startsWith('(') ? 
                '(' + (optionNumberingStyle.includes('1') ? correctOptionIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + correctOptionIndex) : String.fromCharCode(65 + correctOptionIndex)) + ')' : 
                (optionNumberingStyle.includes('1') ? correctOptionIndex + 1 : optionNumberingStyle.includes('a') ? String.fromCharCode(97 + correctOptionIndex) : String.fromCharCode(65 + correctOptionIndex)) + optionNumberingStyle.replace(/[A-Za-z0-9]/g, '');
              return `
            <div class="answer-item" style="margin-bottom: 15px; page-break-inside: avoid;">
              <div style="font-weight: bold;">${index + 1}. ${optionLabel}</div>
              ${answerKeyDisplayMode === 'KEY_AND_EXPLANATION' && q.explanation ? `<div style="margin-top: 5px; padding-left: 15px;" id="explanation-${q.id}">${useKatex && containsKaTeX(q.explanation) ? prepareForKaTeX(q.explanation) : escapeHTML(q.explanation)}</div>` : ''}
            </div>
          `}).join('')}
        `}
      </div>
      ` : ''}

      ${footer.length > 0 ? `<div class="footer">${footer.map(f => `<div>${f}</div>`).join('')}</div>` : ''}

    </body>
    </html>
  `;

  return htmlContent;

};