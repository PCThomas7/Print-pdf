import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import KatexRenderer from '../KaTeX/KatexRenderer';

/**
 * QuizPreview Component
 * Displays a preview of how the quiz will look when generated as PDF
 */
const QuizPreview = () => {
  const { 
    paperTitle, 
    instructions, 
    header, 
    footer, 
    watermark, 
    questions,
    showPreview,
    setShowPreview
  } = useQuiz();

  if (!showPreview) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Quiz Preview</h2>
          <button 
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close Preview
          </button>
        </div>

        <div className="p-8">
          {/* Paper Title */}
          {paperTitle && (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                <KatexRenderer text={paperTitle} />
              </h1>
            </div>
          )}

          {/* Header */}
          {header && (
            <div className="text-center mb-4 text-gray-600">
              <KatexRenderer text={header} />
            </div>
          )}

          {/* Instructions */}
          {instructions && (
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-bold mb-2">Instructions:</h3>
              <div className="whitespace-pre-line">
                <KatexRenderer text={instructions} />
              </div>
            </div>
          )}

          {/* Watermark */}
          {watermark.enabled && watermark.text && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 overflow-hidden">
              <div className="transform rotate-45 text-6xl font-bold text-gray-400 whitespace-nowrap">
                <KatexRenderer text={watermark.text} />
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question, qIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex mb-3">
                  <span className="font-bold mr-2">{qIndex + 1}.</span>
                  <div>
                    <div className="mb-2">
                      <KatexRenderer text={question.questionText} />
                    </div>
                    {question.questionImage && (
                      <div className="mb-3">
                        <img 
                          src={question.questionImage} 
                          alt={`Question ${qIndex + 1}`} 
                          className="max-h-40 border border-gray-200 rounded" 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-start">
                      <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                      <div>
                        <div>
                          <KatexRenderer text={option.text} />
                        </div>
                        {option.image && (
                          <div className="mt-1">
                            <img 
                              src={option.image} 
                              alt={`Option ${String.fromCharCode(65 + oIndex)}`} 
                              className="max-h-32 border border-gray-200 rounded" 
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Display correct answer and explanation if available */}
                {question.correctAnswer !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-green-600 font-medium">
                      Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                    </p>
                    {question.explanation && (
                      <div className="mt-1 text-gray-700">
                        <strong>Explanation:</strong> <KatexRenderer text={question.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-600">
              <KatexRenderer text={footer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPreview;