import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Home Component
 * Provides a form to input a Quiz ID and a button to print the quiz
 */
const Home = () => {
  const [quizId, setQuizId] = useState('');
  const navigate = useNavigate();

  const handlePrint = () => {
    if (quizId.trim()) {
      navigate(`/admin/quizzes/print/${quizId}`);
    } else {
      alert('Please enter a Quiz ID');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">MCQ PDF Generator</h1>
        <p className="text-gray-600">Create beautiful multiple-choice question papers with mathematical expressions</p>
      </header>

      <div className="bg-white border border-gray-200 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Print Quiz</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quiz ID
          </label>
          <input
            type="text"
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Quiz ID"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Print Quiz
          </button>
          
          <Link 
            to="/create" 
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Quiz Manually
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;