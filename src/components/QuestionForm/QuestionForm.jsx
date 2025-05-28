import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import KatexRenderer from '../KaTeX/KatexRenderer';

/**
 * QuestionForm Component
 * Provides UI for editing a single question and its options
 */
const QuestionForm = ({ question }) => {
  const { updateQuestion, updateOption, removeQuestion } = useQuiz();

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Question {question.id}</h3>
        <button
          onClick={() => removeQuestion(question.id)}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text
        </label>
        <textarea
          value={question.questionText}
          onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter question text (supports KaTeX)"
        />
        {question.questionText && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <KatexRenderer text={question.questionText} />
          </div>
        )}
      </div>

      {/* Question Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Image URL (optional)
        </label>
        <input
          type="text"
          value={question.questionImage || ''}
          onChange={(e) => updateQuestion(question.id, 'questionImage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter image URL"
        />
        {question.questionImage && (
          <div className="mt-2">
            <img 
              src={question.questionImage} 
              alt="Question" 
              className="w-40 h-40 object-cover border border-gray-200 rounded" 
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Options</h4>
        <div className="space-y-6">
          {question.options.map((option, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="font-medium text-gray-700 mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
              </div>
              
              {/* Option Text */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option Text
                </label>
                <textarea
                  value={option.text}
                  onChange={(e) => updateOption(question.id, index, 'text', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter option text (supports KaTeX)"
                />
                {option.text && (
                  <div className="mt-2 p-2 bg-white rounded">
                    <KatexRenderer text={option.text} />
                  </div>
                )}
              </div>
              
              {/* Option Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option Image URL (optional)
                </label>
                <input
                  type="text"
                  value={option.image || ''}
                  onChange={(e) => updateOption(question.id, index, 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL"
                />
                {option.image && (
                  <div className="mt-2">
                    <img 
                      src={option.image} 
                      alt={`Option ${String.fromCharCode(65 + index)}`} 
                      className="w-32 h-32 object-cover border border-gray-200 rounded" 
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;