import React from 'react';
import { useQuiz } from '../../context/QuizContext';
import KatexRenderer from '../KaTeX/KatexRenderer';

/**
 * PaperSettings Component
 * Provides UI for configuring paper settings like title, instructions, header, footer, and watermark
 */
const PaperSettings = () => {
  const {
    paperTitle,
    setPaperTitle,
    instructions,
    setInstructions,
    header,
    setHeader,
    footer,
    setFooter,
    watermark,
    setWatermark,
    answerKeyDisplayMode,
    setAnswerKeyDisplayMode,
    fontSize,
    setFontSize,
    fontWeight,
    setFontWeight,
    fontColor,
    setFontColor,
    optionNumberingStyle,
    setOptionNumberingStyle
  } = useQuiz();

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Paper Settings</h2>
      
      <div className="space-y-4">
        {/* Paper Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paper Title
          </label>
          <input
            type="text"
            value={paperTitle}
            onChange={(e) => setPaperTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter paper title"
          />
          {paperTitle && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <KatexRenderer text={paperTitle} />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter instructions"
          />
          {instructions && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <KatexRenderer text={instructions} />
            </div>
          )}
        </div>

        {/* Header */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Header
          </label>
          <input
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter header text"
          />
          {header && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <KatexRenderer text={Array.isArray(header) ? header.join(' ') : header} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Footer
          </label>
          <input
            type="text"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter footer text"
          />
          {footer && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <KatexRenderer text={Array.isArray(footer) ? footer.join(' ') : footer} />
            </div>
          )}
        </div>

        {/* Watermark */}
        <div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="watermarkEnabled"
              checked={watermark.enabled}
              onChange={(e) => setWatermark({ ...watermark, enabled: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="watermarkEnabled" className="text-sm font-medium text-gray-700">
              Enable Watermark
            </label>
          </div>
          
          {watermark.enabled && (
            <div>
              <input
                type="text"
                value={watermark.text}
                onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter watermark text"
              />
              {watermark.text && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <KatexRenderer text={watermark.text} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Answer Key Display Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer Key Display
          </label>
          <select
            value={answerKeyDisplayMode}
            onChange={(e) => setAnswerKeyDisplayMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="NONE">None</option>
            <option value="KEY_ONLY">Answer Key Only</option>
            <option value="KEY_AND_EXPLANATION">Answer Key with Explanations</option>
          </select>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Size (px)
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter font size"
          />
        </div>

        {/* Font Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Weight
          </label>
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        {/* Font Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Color
          </label>
          <input
            type="color"
            value={fontColor}
            onChange={(e) => setFontColor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-10"
          />
        </div>

        {/* Option Numbering Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Option Numbering Style
          </label>
          <select
            value={optionNumberingStyle}
            onChange={(e) => setOptionNumberingStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="A)">A)</option>
            <option value="(A)">(A)</option>
            <option value="a)">a)</option>
            <option value="(a)">(a)</option>
            <option value="1)">1)</option>
            <option value="(1)">(1)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PaperSettings;