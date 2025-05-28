import React from 'react';
import { QuizProvider } from '../../context/QuizContext';
import JsonImport from '../JsonImport/JsonImport';
import PaperSettings from '../PaperSettings/PaperSettings';
import QuestionList from '../QuestionList/QuestionList';
import ActionButtons from '../ActionButtons/ActionButtons';
import QuizPreview from '../Preview/QuizPreview';

/**
 * MCQPDFGenerator Component
 * Main component that combines all the quiz creation functionality
 */
const MCQPDFGenerator = () => {
  return (
    <QuizProvider>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">MCQ PDF Generator</h1>
          <p className="text-gray-600">Create beautiful multiple-choice question papers with mathematical expressions</p>
        </header>

        <JsonImport />
        <PaperSettings />
        <ActionButtons />
        <QuestionList />
        <QuizPreview />
      </div>
    </QuizProvider>
  );
};

export default MCQPDFGenerator;