import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { generatePDF } from '../../utils/pdfGenerator';

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
    answerKeyDisplayMode
  } = useQuiz();

  // Handle PDF generation
  const handleGeneratePDF = () => {
    const headerArray = typeof header === 'string' ? (header ? header.split('\n') : []) : header;
    const footerArray = typeof footer === 'string' ? (footer ? footer.split('\n') : []) : footer;

    generatePDF({
      questions,
      paperTitle,
      instructions,
      header: headerArray,
      footer: footerArray,
      watermark,
      answerKeyDisplayMode
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