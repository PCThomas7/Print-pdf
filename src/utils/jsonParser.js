/**
 * JSON Parser Utility
 * Parses JSON quiz data and converts it to the application's format
 */

/**
 * Parse JSON quiz data and extract questions, metadata, etc.
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object} - The parsed quiz data or error message
 */
export const parseQuizJson = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    const quiz = data.quiz;
    
    if (!quiz) {
      return { success: false, message: "Invalid JSON: 'quiz' object not found" };
    }

    const result = {
      success: true,
      paperTitle: quiz.title || "",
      header: [],
      instructions: "",
      footer: [],
      watermark: { enabled: false, text: "" },
      questions: [],
      sections: [] // Add sections array to store section information
    };

    // Extract metadata
    if (quiz.metadata) {
      if (quiz.metadata.header && Array.isArray(quiz.metadata.header)) {
        result.header = quiz.metadata.header;
      }
      
      if (quiz.metadata.instructions && Array.isArray(quiz.metadata.instructions)) {
        result.instructions = quiz.metadata.instructions.join('\n');
      }
      
      if (quiz.metadata.footer && Array.isArray(quiz.metadata.footer)) {
        result.footer = quiz.metadata.footer;
      }
      
      if (quiz.metadata.watermark) {
        result.watermark = quiz.metadata.watermark;
      }
    }

    // Extract questions from sections
    if (quiz.sections && Array.isArray(quiz.sections)) {
      const extractedQuestions = [];
      const sections = [];
      
      quiz.sections.forEach(section => {
        if (section.questions && Array.isArray(section.questions)) {
          const sectionQuestions = [];
          const sectionName = section.name || "";
          
          section.questions.forEach(q => {
            const question = {
              id: q._id || q.id || Date.now() + Math.random(),
              questionText: q.question_text ? q.question_text.replace(/\\\\/g, '') : "",
              questionImage: q.image_url || "",
              options: [
                { 
                  text: q.option_a ? q.option_a.replace(/\\\\/g, '') : "", 
                  image: q.option_a_image_url || "" 
                },
                { 
                  text: q.option_b ? q.option_b.replace(/\\\\/g, '') : "", 
                  image: q.option_b_image_url || "" 
                },
                { 
                  text: q.option_c ? q.option_c.replace(/\\\\/g, '') : "", 
                  image: q.option_c_image_url || "" 
                },
                { 
                  text: q.option_d ? q.option_d.replace(/\\\\/g, '') : "", 
                  image: q.option_d_image_url || "" 
                }
              ],
              correctAnswer: q.correct_answer,
              explanation: q.explanation,
              tags: q.tags || {},
              sectionName: sectionName // Add section name to each question
            };
            
            // Add option E if it exists
            if (q.option_e && q.option_e.trim()) {
              question.options.push({
                text: q.option_e.replace(/\\\\/g, ''),
                image: q.option_e_image_url || ""
              });
            }
            
            extractedQuestions.push(question);
            sectionQuestions.push(question);
          });
          
          // Add section info
          if (sectionQuestions.length > 0) {
            sections.push({
              name: sectionName,
              questions: sectionQuestions
            });
          }
        }
      });
      
      if (extractedQuestions.length > 0) {
        result.questions = extractedQuestions;
        result.sections = sections; // Add sections to result
        result.message = `Successfully loaded ${extractedQuestions.length} questions from JSON!`;
      } else {
        result.message = "No questions found in the JSON data";
      }
    }
    
    return result;
  } catch (error) {
    return { success: false, message: "Invalid JSON format: " + error.message };
  }
};

/**
 * Get sample JSON data for demonstration
 * @returns {string} - Sample JSON string
 */
export const getSampleJson = () => {
  return `{
    "message": "Quiz fetched successfully",
    "quiz": {
        "metadata": {
            "header": ["NEET 2026 Preparation Test"],
            "instructions": ["Choose the correct answer for each question", "Mark your answers clearly", "Time allowed: 90 minutes"],
            "footer": ["Good Luck!"],
            "watermark": {
                "enabled": true,
                "text": "PROF. P.C. THOMAS & CHAITHANYA CLASSES"
            }
        },
        "title": "HUMAN REPRODUCTION DPP-2 GAMETOGENESIS, MENSTRUAL CYCLE",
        "sections": [
            {
                "name": "Biology Section",
                "questions": [
                    {
                        "_id": "sample1",
                        "question_text": "At which stage of life the oogenesis process is initiated?",
                        "option_a": "Puberty",
                        "option_b": "Embryonic development stage",
                        "option_c": "Birth",
                        "option_d": "Adult",
                        "correct_answer": "B",
                        "explanation": "Oogenesis is initiated during embryonic development stage when a couple of million oogonia are formed within each fetal ovary."
                    }
                ]
            }
        ]
    }
}`;
};