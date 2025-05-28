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
export const generatePDF = ({
  paperTitle,
  header,
  instructions,
  questions,
  footer,
  watermark
}) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${paperTitle}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js"></script>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          margin: 15px;
          font-size: 12px;
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
        
        /* Print specific styles */
        @media print {
          body { 
            margin: 12px;
            font-size: 11px;
          }
          .questions-container {
            column-gap: 20px;
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
            <div id="question-${question.id}-text"></div>
            ${question.questionImage ? `<img src="${question.questionImage}" class="question-image" alt="Question ${index + 1} Image">` : ''}
          </div>
          <div class="options">
            ${question.options.map((option, optIndex) => `
              <div class="option">
                <div class="option-label">${String.fromCharCode(65 + optIndex)})</div>
                <div class="option-content">
                  <div id="option-${question.id}-${optIndex}"></div>
                  ${option.image ? `<img src="${option.image}" class="option-image" alt="Option ${String.fromCharCode(65 + optIndex)} Image">` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      </div>

      ${footer.length > 0 ? `<div class="footer">${footer.map(f => `<div>${f}</div>`).join('')}</div>` : ''}

      <script>
        // Wait for KaTeX to load then render all math content
        function renderAllMath() {
          if (!window.katex) {
            setTimeout(renderAllMath, 100);
            return;
          }

          ${questions.map(question => `
            // Render question text
            try {
              const questionElement = document.getElementById('question-${question.id}-text');
              if (questionElement) {
                questionElement.innerHTML = renderMathContent('${question.questionText.replace(/'/g, "\\'")}')
              }
            } catch (e) {
              console.error('Error rendering question ${question.id}:', e);
            }

            // Render options
            ${question.options.map((option, optIndex) => `
              try {
                const optionElement = document.getElementById('option-${question.id}-${optIndex}');
                if (optionElement) {
                  optionElement.innerHTML = renderMathContent('${option.text.replace(/'/g, "\\'")}')
                }
              } catch (e) {
                console.error('Error rendering option ${question.id}-${optIndex}:', e);
              }
            `).join('')}
          `).join('')}

          // Auto-print after rendering
          setTimeout(() => {
            window.print();
          }, 1000);
        }

        function renderMathContent(text) {
          if (!text || !window.katex) return text;
          
          // Simple math detection and rendering
          try {
            // Handle display math $$...$$ 
            text = text.replace(/\$\$(.*?)\$\$/g, (match, math) => {
              try {
                return katex.renderToString(math, {displayMode: true, throwOnError: false});
              } catch (e) {
                return match;
              }
            });
            
            // Handle inline math $...$
            text = text.replace(/\$(.*?)\$/g, (match, math) => {
              try {
                return katex.renderToString(math, {displayMode: false, throwOnError: false});
              } catch (e) {
                return match;
              }
            });
            
            // Handle line breaks
            text = text.replace(/\\\\\\\\/g, '<br/>');
            
            return text;
          } catch (e) {
            return text;
          }
        }

        renderAllMath();
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  return printWindow;
};