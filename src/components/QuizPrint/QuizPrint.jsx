import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MCQPDFGenerator from '../MCQPDFGenerator/MCQPDFGenerator';
import { parseQuizJson } from '../../utils/jsonParser';

/**
 * QuizPrint Component
 * Fetches quiz data from API using Quiz ID from URL and renders MCQPDFGenerator
 */
const QuizPrint = () => {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://backend.professorpcthomas.com/api/quizzes/${quizId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch quiz: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const parsedData = parseQuizJson(JSON.stringify(data));
        
        if (!parsedData.success) {
          throw new Error(parsedData.message);
        }
        
        setQuizData(parsedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
        <p className="text-gray-600 mt-4">Loading quiz data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <p className="mt-4">
          <a href="/" className="text-blue-500 hover:underline">Return to Home</a>
        </p>
      </div>
    );
  }

  return <MCQPDFGenerator initialData={quizData} />;
};

export default QuizPrint;