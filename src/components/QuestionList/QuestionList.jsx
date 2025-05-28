import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import QuestionForm from '../QuestionForm/QuestionForm';

/**
 * QuestionList Component
 * Renders a list of questions and provides a button to add new questions
 */
const QuestionList = () => {
  const { questions, addQuestion } = useQuiz();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500">No questions added yet. Click "Add Question" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map(question => (
            <QuestionForm key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionList;