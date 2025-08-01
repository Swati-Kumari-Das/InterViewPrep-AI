const { GoogleGenAI } = require("@google/genai"); // Fixed package name
const { conceptExplainPrompt ,questionAnswerPrompt} = require("../utils/prompts"); // Fixed path


// Initialize Google Generative AI
const ai = new GoogleGenAI({apiKey:process.env.GENAI_API_KEY}); // Fixed env variable name


/**
 * @desc    Generate interview questions and answers using Gemini AI
 * @route   POST /api/ai/generate-questions
 * @access  Private
 */
const generateInterviewQuestions = async (req, res) => {
      try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ 
              
                message: "Missing required fields: role, experience, topicsToFocus, numberOfQuestions" 
            });
        }

        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
      
        const response = await ai.models.generateContent({
            model:"gemini-2.0-flash-lite",
            contents:prompt,
        });
        const rawText = response.text;

        // Clean response text
        const cleanedText = rawText
            .replace(/^```json\s*/, "")  // Remove starting ```json
            .replace(/```$/, "")      // Remove ending ```
            .trim();                  // Remove extra spaces

         //Now Safe to Parse
         const data=JSON.parse(cleanedText);


        res.status(200).json(data);

    } catch (error) {
      
        res.status(500).json({
          
            message: "Failed to generate questions",
            error: error.message
        });
    }
};




/**
 * @desc    Generate explanation for an interview concept
 * @route   POST /api/ai/generate-explanation
 * @access  Private
 */
const generateConceptExplanation = async (req, res) => {
    try {
      const { question } = req.body;

        if (!question) {
            return res.status(400).json({ 
                
                message: "Missing required feilds" 
            });
        }

        const prompt = conceptExplainPrompt(question);
        
        const response = await ai.models.generateContent({
            model:"gemini-2.0-flash-lite",
            contents:prompt,
        });
        const rawText = response.text;

        // Clean response text
        const cleanedText = rawText
            .replace(/^```json\s*/, "")  // Remove starting ```json
            .replace(/```$/, "")      // Remove ending ```
            .trim();                  // Remove extra spaces

        // Parse and validate response
        const data = JSON.parse(cleanedText);
       

        res.status(200).json(data);


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate explanation",
            error: error.message
        });
    }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };