import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, Eye, FileText } from 'lucide-react';

// KaTeX Renderer Component (from your provided code)
const KatexRendered = ({ content, displayMode = false, className = '' }) => {
  const containerRef = useRef(null);
  const [renderedHTML, setRenderedHTML] = useState('');
  const [error, setError] = useState('');
  const [katexLoaded, setKatexLoaded] = useState(false);

  // Simple text line break processor
  const processTextLineBreaks = (text) => {
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
      renderKaTeX(content);
    }
  }, [content, displayMode, katexLoaded]);

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
          
          if (cell.match(/^\$.*\$/)) {
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

// Main MCQ PDF Generator Component
const MCQPDFGenerator = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      questionText: "What is the derivative of $f(x) = x^3 + 2x^2 - 5x + 7$?",
      questionImage: "",
      options: [
        { text: "$f'(x) = 3x^2 + 4x - 5$", image: "" },
        { text: "$f'(x) = x^2 + 2x - 5$", image: "" },
        { text: "$f'(x) = 3x^2 + 4x + 7$", image: "" },
        { text: "$f'(x) = 3x + 4 - 5$", image: "" }
      ]
    },
    {
      id: 2,
      questionText: "Solve the quadratic equation: $x^2 - 5x + 6 = 0$",
      questionImage: "",
      options: [
        { text: "$x = 2, x = 3$", image: "" },
        { text: "$x = 1, x = 6$", image: "" },
        { text: "$x = -2, x = -3$", image: "" },
        { text: "$x = 5, x = 1$", image: "" }
      ]
    },
    {
      id: 3,
      questionText: "What is the integral $\\int 2x \\, dx$?",
      questionImage: "",
      options: [
        { text: "$x^2 + C$", image: "" },
        { text: "$2x^2 + C$", image: "" },
        { text: "$\\frac{x^2}{2} + C$", image: "" },
        { text: "$2 + C$", image: "" }
      ]
    },
    {
      id: 4,
      questionText: "Which of the following matrices is the identity matrix of order 2?",
      questionImage: "",
      options: [
        { text: "$\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$", image: "" },
        { text: "$\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$", image: "" },
        { text: "$\\begin{pmatrix} 1 & 1 \\\\ 1 & 1 \\end{pmatrix}$", image: "" },
        { text: "$\\begin{pmatrix} 2 & 0 \\\\ 0 & 2 \\end{pmatrix}$", image: "" }
      ]
    },
    {
      id: 5,
      questionText: "What is the limit $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?",
      questionImage: "",
      options: [
        { text: "$1$", image: "" },
        { text: "$0$", image: "" },
        { text: "$\\infty$", image: "" },
        { text: "Does not exist", image: "" }
      ]
    },
    {
      id: 6,
      questionText: "In chemistry, what is the molecular formula for sulfuric acid?",
      questionImage: "",
      options: [
        { text: "$\\text{H}_2\\text{SO}_4$", image: "" },
        { text: "$\\text{H}_2\\text{SO}_3$", image: "" },
        { text: "$\\text{HSO}_4$", image: "" },
        { text: "$\\text{H}_3\\text{SO}_4$", image: "" }
      ]
    },
    {
      id: 7,
      questionText: "The area of a circle with radius $r$ is given by:",
      questionImage: "",
      options: [
        { text: "$A = \\pi r^2$", image: "" },
        { text: "$A = 2\\pi r$", image: "" },
        { text: "$A = \\pi r$", image: "" },
        { text: "$A = r^2$", image: "" }
      ]
    },
    {
      id: 8,
      questionText: "What is the value of $\\log_2 8$?",
      questionImage: "",
      options: [
        { text: "$3$", image: "" },
        { text: "$2$", image: "" },
        { text: "$4$", image: "" },
        { text: "$8$", image: "" }
      ]
    },
    {
      id: 9,
      questionText: "In physics, Newton's second law is expressed as:",
      questionImage: "",
      options: [
        { text: "$F = ma$", image: "" },
        { text: "$F = \\frac{mv^2}{r}$", image: "" },
        { text: "$F = \\frac{1}{2}mv^2$", image: "" },
        { text: "$F = mg$", image: "" }
      ]
    },
    {
      id: 10,
      questionText: "What is the determinant of the matrix $\\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$?",
      questionImage: "",
      options: [
        { text: "$10$", image: "" },
        { text: "$14$", image: "" },
        { text: "$12$", image: "" },
        { text: "$8$", image: "" }
      ]
    },
    {
      id: 11,
      questionText: "The sum of the infinite geometric series $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\ldots$ is:",
      questionImage: "",
      options: [
        { text: "$2$", image: "" },
        { text: "$\\frac{3}{2}$", image: "" },
        { text: "$1$", image: "" },
        { text: "$\\infty$", image: "" }
      ]
    },
    {
      id: 12,
      questionText: "Which equation represents a parabola opening upward?",
      questionImage: "",
      options: [
        { text: "$y = x^2 + 3x + 2$", image: "" },
        { text: "$y = -x^2 + 3x + 2$", image: "" },
        { text: "$x = y^2 + 3y + 2$", image: "" },
        { text: "$x + y = 5$", image: "" }
      ]
    },
    {
      id: 13,
      questionText: "In probability, if two events A and B are independent, then:",
      questionImage: "",
      options: [
        { text: "$P(A \\cap B) = P(A) \\cdot P(B)$", image: "" },
        { text: "$P(A \\cap B) = P(A) + P(B)$", image: "" },
        { text: "$P(A \\cap B) = P(A) - P(B)$", image: "" },
        { text: "$P(A \\cap B) = \\frac{P(A)}{P(B)}$", image: "" }
      ]
    },
    {
      id: 14,
      questionText: "What is the Taylor series expansion of $e^x$ around $x = 0$?",
      questionImage: "",
      options: [
        { text: "$\\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\ldots$", image: "" },
        { text: "$\\sum_{n=0}^{\\infty} x^n = 1 + x + x^2 + x^3 + \\ldots$", image: "" },
        { text: "$\\sum_{n=1}^{\\infty} \\frac{x^n}{n} = x + \\frac{x^2}{2} + \\frac{x^3}{3} + \\ldots$", image: "" },
        { text: "$\\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}$", image: "" }
      ]
    },
    {
      id: 15,
      questionText: "In complex analysis, what is the modulus of the complex number $z = 3 + 4i$?",
      questionImage: "",
      options: [
        { text: "$|z| = 5$", image: "" },
        { text: "$|z| = 7$", image: "" },
        { text: "$|z| = \\sqrt{7}$", image: "" },
        { text: "$|z| = 12$", image: "" }
      ]
    }
  ]);

  const [paperTitle, setPaperTitle] = useState("Comprehensive Mathematics & Science MCQ Test");
  const [instructions, setInstructions] = useState("1. Choose the correct answer for each question.\n2. Mark your answers clearly on the answer sheet.\n3. Time allowed: 90 minutes.\n4. Total questions: 15\n5. Each question carries 4 marks.\n6. No negative marking.\n7. Use of calculators is not permitted.");
  const [header, setHeader] = useState([]);
  const [footer, setFooter] = useState([]);
  const [watermark, setWatermark] = useState({ enabled: false, text: "" });
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Parse JSON quiz data
  const parseQuizJson = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const quiz = data.quiz;
      
      if (!quiz) {
        alert("Invalid JSON: 'quiz' object not found");
        return;
      }

      // Extract metadata
      if (quiz.title) {
        setPaperTitle(quiz.title);
      }
      
      if (quiz.metadata) {
        if (quiz.metadata.header && Array.isArray(quiz.metadata.header)) {
          setHeader(quiz.metadata.header);
        }
        
        if (quiz.metadata.instructions && Array.isArray(quiz.metadata.instructions)) {
          setInstructions(quiz.metadata.instructions.join('\n'));
        }
        
        if (quiz.metadata.footer && Array.isArray(quiz.metadata.footer)) {
          setFooter(quiz.metadata.footer);
        }
        
        if (quiz.metadata.watermark) {
          setWatermark(quiz.metadata.watermark);
        }
      }

      // Extract questions from sections
      if (quiz.sections && Array.isArray(quiz.sections)) {
        const extractedQuestions = [];
        
        quiz.sections.forEach(section => {
          if (section.questions && Array.isArray(section.questions)) {
            section.questions.forEach(q => {
              const question = {
                id: q._id || q.id || Date.now() + Math.random(),
                questionText: q.question_text ? q.question_text.replace(/\\\\/g, '') : "",
                questionImage: q.image_url || "",
                options: [
                  { 
                    text: q.option_a ? q.option_a.replace(/\\\\/g, '') : "", 
                    image: q.option_a_image_url || "" 
                  },
                  { 
                    text: q.option_b ? q.option_b.replace(/\\\\/g, '') : "", 
                    image: q.option_b_image_url || "" 
                  },
                  { 
                    text: q.option_c ? q.option_c.replace(/\\\\/g, '') : "", 
                    image: q.option_c_image_url || "" 
                  },
                  { 
                    text: q.option_d ? q.option_d.replace(/\\\\/g, '') : "", 
                    image: q.option_d_image_url || "" 
                  }
                ],
                correctAnswer: q.correct_answer,
                explanation: q.explanation,
                tags: q.tags || {}
              };
              
              // Add option E if it exists
              if (q.option_e && q.option_e.trim()) {
                question.options.push({
                  text: q.option_e.replace(/\\\\/g, ''),
                  image: q.option_e_image_url || ""
                });
              }
              
              extractedQuestions.push(question);
            });
          }
        });
        
        if (extractedQuestions.length > 0) {
          setQuestions(extractedQuestions);
          alert(`Successfully loaded ${extractedQuestions.length} questions from JSON!`);
        } else {
          alert("No questions found in the JSON data");
        }
      }
      
      setShowJsonImport(false);
      setJsonInput("");
      
    } catch (error) {
      alert("Invalid JSON format: " + error.message);
    }
  };

  // Load sample JSON data
  const loadSampleJson = () => {
    const sampleJson = `{
    "message": "Quiz fetched successfully",
    "quiz": {
        "metadata": {
            "header": ["NEET 2026 Preparation Test"],
            "instructions": ["Choose the correct answer for each question", "Mark your answers clearly", "Time allowed: 90 minutes"],
            "footer": ["Good Luck!"],
            "watermark": {
                "enabled": true,
                "text": "PROF. P.C. THOMAS & CHAITHANYA CLASSES"
            }
        },
        "title": "HUMAN REPRODUCTION DPP-2 GAMETOGENESIS, MENSTRUAL CYCLE",
        "sections": [
            {
                "name": "Biology Section",
                "questions": [
                    {
                        "_id": "sample1",
                        "question_text": "At which stage of life the oogenesis process is initiated?",
                        "option_a": "Puberty",
                        "option_b": "Embryonic development stage",
                        "option_c": "Birth",
                        "option_d": "Adult",
                        "correct_answer": "B",
                        "explanation": "Oogenesis is initiated during embryonic development stage when a couple of million oogonia are formed within each fetal ovary."
                    }
                ]
            }
        ]
    }
}`;
    setJsonInput(sampleJson);
  };
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: "",
      questionImage: "",
      options: [
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update question
  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // Update option
  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? { ...opt, [field]: value } : opt
            )
          }
        : q
    ));
  };

  // Generate PDF
  const generatePDF = async () => {
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
                  questionElement.innerHTML = renderMathContent('${question.questionText.replace(/'/g, "\\'")}');
                }
              } catch (e) {
                console.error('Error rendering question ${question.id}:', e);
              }

              // Render options
              ${question.options.map((option, optIndex) => `
                try {
                  const optionElement = document.getElementById('option-${question.id}-${optIndex}');
                  if (optionElement) {
                    optionElement.innerHTML = renderMathContent('${option.text.replace(/'/g, "\\'")}');
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
              text = text.replace(/\\$\\$(.*?)\\$\\$/g, (match, math) => {
                try {
                  return katex.renderToString(math, {displayMode: true, throwOnError: false});
                } catch (e) {
                  return match;
                }
              });
              
              // Handle inline math $...$
              text = text.replace(/\\$(.*?)\\$/g, (match, math) => {
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
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          MCQ Question Paper Generator
        </h1>
        <p className="text-blue-100">Create professional MCQ question papers with LaTeX support and JSON import</p>
      </div>

      {/* JSON Import Section */}
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-yellow-800">Import Quiz from JSON</h2>
          <button
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            {showJsonImport ? 'Hide JSON Import' : 'Show JSON Import'}
          </button>
        </div>
        
        {showJsonImport && (
          <div className="space-y-4">
            <p className="text-sm text-yellow-700">
              Paste your quiz JSON data below to automatically populate the form. This will replace existing questions.
            </p>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={loadSampleJson}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Load Sample JSON
              </button>
            </div>
            
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
              placeholder="Paste your JSON quiz data here..."
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => parseQuizJson(jsonInput)}
                disabled={!jsonInput.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Import Quiz Data
              </button>
              <button
                onClick={() => {setJsonInput(""); setShowJsonImport(false);}}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear & Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paper Settings */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Paper Settings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paper Title
            </label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter paper title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter instructions for students"
            />
          </div>
        </div>
        
        {/* Additional metadata fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Header Lines (one per line)
            </label>
            <textarea
              value={header.join('\n')}
              onChange={(e) => setHeader(e.target.value.split('\n').filter(line => line.trim()))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional header lines"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Lines (one per line)
            </label>
            <textarea
              value={footer.join('\n')}
              onChange={(e) => setFooter(e.target.value.split('\n').filter(line => line.trim()))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Footer lines"
            />
          </div>
        </div>
        
        {/* Watermark settings */}
        <div className="mt-4 p-4 bg-white rounded border">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="watermark-enabled"
              checked={watermark.enabled}
              onChange={(e) => setWatermark({...watermark, enabled: e.target.checked})}
              className="w-4 h-4 text-blue-600"
            />
            <label htmlFor="watermark-enabled" className="text-sm font-medium text-gray-700">
              Enable Watermark
            </label>
          </div>
          {watermark.enabled && (
            <input
              type="text"
              value={watermark.text}
              onChange={(e) => setWatermark({...watermark, text: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Watermark text"
            />
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
              <button
                onClick={() => removeQuestion(question.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text (LaTeX supported)
              </label>
              <textarea
                value={question.questionText}
                onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question text (use $ for inline math, $$ for display math)"
              />
              {question.questionText && (
                <div className="mt-2 p-3 bg-gray-50 rounded border">
                  <div className="text-sm text-gray-600 mb-1">Preview:</div>
                  <KatexRendered content={question.questionText} />
                </div>
              )}
            </div>

            {/* Question Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Image URL (optional)
              </label>
              <input
                type="url"
                value={question.questionImage}
                onChange={(e) => updateQuestion(question.id, 'questionImage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {question.questionImage && (
                <img
                  src={question.questionImage}
                  alt="Question"
                  className="mt-2 max-w-xs h-auto border rounded"
                  onError={(e) => {e.target.style.display = 'none'}}
                />
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options (LaTeX supported)
              </label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="border border-gray-200 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700 min-w-[30px]">
                      {String.fromCharCode(65 + optIndex)})
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(question.id, optIndex, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${String.fromCharCode(65 + optIndex)} text`}
                    />
                  </div>
                  
                  {option.text && (
                    <div className="ml-8 mb-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="text-gray-600 mb-1">Preview:</div>
                      <KatexRendered content={option.text} />
                    </div>
                  )}
                  
                  <div className="ml-8">
                    <input
                      type="url"
                      value={option.image}
                      onChange={(e) => updateOption(question.id, optIndex, 'image', e.target.value)}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Option image URL (optional)"
                    />
                    {option.image && (
                      <img
                        src={option.image}
                        alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className="mt-2 max-w-[200px] h-auto border rounded"
                        onError={(e) => {e.target.style.display = 'none'}}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Question
        </button>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Eye className="w-5 h-5" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          disabled={questions.length === 0}
        >
          <Download className="w-5 h-5" />
          Generate PDF
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-8 border-t-2 border-purple-200 pt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{paperTitle}</h2>
          
          {header.length > 0 && (
            <div className="text-center mb-4">
              {header.map((line, index) => (
                <div key={index} className="text-gray-600">{line}</div>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <pre className="whitespace-pre-wrap text-sm">{instructions}</pre>
          </div>

          {watermark.enabled && (
            <div className="text-center mb-4 text-gray-400 italic">
              Watermark: {watermark.text}
            </div>
          )}

          {questions.map((question, index) => (
            <div key={question.id} className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
              <div className="font-semibold mb-3">Question {index + 1}:</div>
              
              <div className="mb-4 pl-4">
                <KatexRendered content={question.questionText} />
                {question.questionImage && (
                  <img
                    src={question.questionImage}
                    alt={`Question ${index + 1}`}
                    className="mt-3 max-w-full h-auto border rounded"
                    onError={(e) => {e.target.style.display = 'none'}}
                  />
                )}
              </div>

              <div className="pl-4 space-y-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-start gap-3">
                    <span className="font-medium min-w-[25px]">
                      {String.fromCharCode(65 + optIndex)})
                    </span>
                    <div className="flex-1">
                      <KatexRendered content={option.text} />
                      {option.image && (
                        <img
                          src={option.image}
                          alt={`Option ${String.fromCharCode(65 + optIndex)}`}
                          className="mt-2 max-w-[200px] h-auto border rounded"
                          onError={(e) => {e.target.style.display = 'none'}}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show additional info if imported from JSON */}
              {question.correctAnswer && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                  <strong>Correct Answer:</strong> {question.correctAnswer}
                  {question.explanation && (
                    <div className="mt-1">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {footer.length > 0 && (
            <div className="text-center mt-8 pt-4 border-t border-gray-300">
              {footer.map((line, index) => (
                <div key={index} className="text-gray-600">{line}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MCQPDFGenerator;