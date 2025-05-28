import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import { parseQuizJson, getSampleJson } from '../../utils/jsonParser';

/**
 * JsonImport Component
 * Provides UI for importing quiz data from JSON
 */
const JsonImport = () => {
  const {
    jsonInput,
    setJsonInput,
    showJsonImport,
    setShowJsonImport,
    setQuizData
  } = useQuiz();

  // Load sample JSON data
  const loadSampleJson = () => {
    setJsonInput(getSampleJson());
  };

  // Handle JSON import
  const handleImport = () => {
    const result = parseQuizJson(jsonInput);
    
    if (result.success) {
      setQuizData(result);
      alert(result.message);
      setShowJsonImport(false);
      setJsonInput("");
    } else {
      alert(result.message);
    }
  };

  return (
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
              onClick={handleImport}
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
  );
};

export default JsonImport;