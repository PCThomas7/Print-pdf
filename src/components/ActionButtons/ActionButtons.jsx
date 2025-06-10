import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { useNavigate } from 'react-router-dom';
import { generatePDF } from '../../utils/pdfGenerator'; // Added import

/**
 * ActionButtons Component
 * Provides buttons for previewing and generating PDF
 */
const ActionButtons = () => {
  const { 
    questions, 
    paperTitle, 
    instructions, 
    header, 
    footer, 
    watermark,
    showPreview,
    setShowPreview,
    answerKeyDisplayMode,
    fontSize,
    fontWeight,
    fontColor,
    optionNumberingStyle
  } = useQuiz();

  const navigate = useNavigate();

  const handleGeneratePDF = () => {
    const headerArray = typeof header === 'string' ? (header ? header.split('\n') : []) : header;
    const footerArray = typeof footer === 'string' ? (footer ? footer.split('\n') : []) : footer;

    // Group questions by section if they have sectionName property
    let sections = [];
    if (questions.length > 0 && questions[0].sectionName) {
      // Create a map of section names to questions
      const sectionMap = {};
      questions.forEach(question => {
        const sectionName = question.sectionName || 'Default Section';
        if (!sectionMap[sectionName]) {
          sectionMap[sectionName] = [];
        }
        sectionMap[sectionName].push(question);
      });
      
      // Convert map to array of section objects
      sections = Object.keys(sectionMap).map(name => ({
        name,
        questions: sectionMap[name]
      }));
    }

    const quizDataForPdf = {
      questions,
      paperTitle,
      instructions,
      header: headerArray,
      footer: footerArray,
      watermark,
      answerKeyDisplayMode,
      fontSize,
      fontWeight,
      fontColor,
      optionNumberingStyle,
      sections: sections.length > 0 ? sections : undefined,
      useKatex: true // Enable KaTeX rendering by default
    };
    // Generate HTML content and navigate to the dedicated PDF page
    const htmlContent = generatePDF(quizDataForPdf);
    navigate('/generated-pdf', { 
      state: { 
        htmlContent,
        questions: quizDataForPdf.questions, // Pass questions for KaTeX rendering
        answerKeyDisplayMode: quizDataForPdf.answerKeyDisplayMode // Pass display mode
      }
    });
  };

  return (
    <div className="flex justify-end gap-4 mb-6">
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
      
      <button
        onClick={handleGeneratePDF}
        disabled={questions.length === 0}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Generate PDF
      </button>
    </div>
  );
};

export default ActionButtons;