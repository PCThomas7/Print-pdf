import { createContext, useState, useContext } from 'react';

// Create the context
const QuizContext = createContext();

/**
 * QuizProvider Component
 * Provides quiz state and functions to the application
 */
export const QuizProvider = ({ children }) => {
  // Default questions
  const defaultQuestions = [
    {
      id: 1,
      questionText: "What is the derivative of $f(x) = x^3 + 2x^2 - 5x + 7$?",
      questionImage: "",
      options: [
        { text: "$f'(x) = 3x^2 + 4x - 5$", image: "" },
        { text: "$f'(x) = x^2 + 2x - 5$", image: "" },
        { text: "$f'(x) = 3x^2 + 4x + 7$", image: "" },
        { text: "$f'(x) = 3x + 4 - 5$", image: "" }
      ]
    },
    {
      id: 2,
      questionText: "Solve the quadratic equation: $x^2 - 5x + 6 = 0$",
      questionImage: "",
      options: [
        { text: "$x = 2, x = 3$", image: "" },
        { text: "$x = 1, x = 6$", image: "" },
        { text: "$x = -2, x = -3$", image: "" },
        { text: "$x = 5, x = 1$", image: "" }
      ]
    },
    {
      id: 3,
      questionText: "What is the integral $\\int 2x \\, dx$?",
      questionImage: "",
      options: [
        { text: "$x^2 + C$", image: "" },
        { text: "$2x^2 + C$", image: "" },
        { text: "$\\frac{x^2}{2} + C$", image: "" },
        { text: "$2 + C$", image: "" }
      ]
    }
  ];

  // State
  const [questions, setQuestions] = useState(defaultQuestions);
  const [paperTitle, setPaperTitle] = useState("Comprehensive Mathematics & Science MCQ Test");
  const [instructions, setInstructions] = useState("1. Choose the correct answer for each question.\n2. Mark your answers clearly on the answer sheet.\n3. Time allowed: 90 minutes.\n4. Total questions: 15\n5. Each question carries 4 marks.\n6. No negative marking.\n7. Use of calculators is not permitted.");
  const [header, setHeader] = useState([]);
  const [footer, setFooter] = useState([]);
  const [watermark, setWatermark] = useState({ enabled: false, text: "" });
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [answerKeyDisplayMode, setAnswerKeyDisplayMode] = useState("NONE"); // NONE, KEY_ONLY, KEY_AND_EXPLANATION

  // Functions
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: "",
      questionImage: "",
      options: [
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? {
            ...q,
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? { ...opt, [field]: value } : opt
            )
          }
        : q
    ));
  };

  // Set all quiz data at once (used when importing from JSON)
  const setQuizData = (data) => {
    if (data.paperTitle) setPaperTitle(data.paperTitle);
    if (data.header) setHeader(data.header);
    if (data.instructions) setInstructions(data.instructions);
    if (data.footer) setFooter(data.footer);
    if (data.watermark) setWatermark(data.watermark);
    if (data.questions && data.questions.length > 0) setQuestions(data.questions);
  };

  // Value to be provided by the context
  const value = {
    questions,
    setQuestions,
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
    jsonInput,
    setJsonInput,
    showJsonImport,
    setShowJsonImport,
    showPreview,
    setShowPreview,
    addQuestion,
    removeQuestion,
    updateQuestion,
    updateOption,
    setQuizData,
    answerKeyDisplayMode,
    setAnswerKeyDisplayMode
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

/**
 * Custom hook to use the quiz context
 * @returns {Object} - Quiz context value
 */
export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};