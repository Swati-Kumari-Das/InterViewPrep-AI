const Question = require("../models/Question");
const Session = require("../models/Session");

// @desc    Add additional questions to an existing session
// @route   POST /api/questions/:sessionId/add
// @access  Private
exports.addQuestionsToSession = async (req, res) => {
    try {
     const { sessionId, questions } = req.body;
      

        // Validate input
        if (!sessionId || !questions || !Array.isArray(questions) ) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid input data"
            });
        }

        // Verify session exists and belongs to user
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ 
               
                message: "Session not found" 
            });
        }

        // Validate each question
        // const invalidQuestions = questions.filter(q => !q.question || typeof q.question !== 'string');
        // if (invalidQuestions.length > 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "All questions must have valid question text"
        //     });
        // }

        // Create new questions
        const createdQuestions = await Question.insertMany(
            questions.map(q => ({
                session: sessionId,
                question: q.question,
                answer: q.answer, // Default empty answer if not provided
                
            }))
        );

        // Update session with new questions
        session.questions.push(...createdQuestions.map(q => q._id));
        await session.save();

        res.status(201).json(
             createdQuestions
           
        );


    } catch (error) {
      
        res.status(500).json({
            success: false,
            message: "Server Error",
          
        });
    }
};

// @desc    Pin or unpin a question
// @route   PATCH /api/questions/:id/pin
// @access  Private
exports.togglePinQuestion = async (req, res) => {
    try {
          const question = await Question.findById(req.params.id);
          if(!question){
            return res.status(404).json({success,message:"Question not found"});

          }
          question.isPinned=!question.isPinned;
          await question.save();
          res.status(200).json({ success: true, question }); 
    } catch (error) {
        
        res.status(500).json({
            success: false,
           
           
        });
    }
};

// @desc    Update a note for a question
// @route   PUT /api/questions/:id/note
// @access  Private
exports.updateQuestionNote = async (req, res) => {
    try {
        const {note}=req.body;
        const question=await Question.findById(req.params.id);
        if(!question){
            return res
            .status(404)
            .json({success: false,message:"Question not found"});
        }
        question.note=note||"";
        await question.save();

        res.status(200).json({success:true,question});
       
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};