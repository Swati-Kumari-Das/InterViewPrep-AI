const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc    Create a new session and linked questions
// @route   POST /api/sessions/create
// @access  Private
exports.createSession = async (req, res) => {
     try {
        const { role, experience, topicsToFocus, description, questions } = req.body;
        const userId = req.user._id; // Fixed from req.user_id to req.user._id

        // Create session
        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
        });

        // Create questions and link to session
        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: session._id, // Fixed from session.__id to session._id
                    question: q.question,
                    answer: q.answer,
                    // Add any additional question fields here
                });
                return question._id; // Fixed from question.__id to question._id
            })
        );

        // Update session with question references
        session.questions = questionDocs;
        await session.save();

        // Populate questions in the response
       // const populatedSession = await Session.findById(session._id).populate('questions');

        res.status(201).json({ 
            success: true, 
            // data: populatedSession 
            session
        });

    } catch (error) {
       
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
           
        });
    }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions/my-sessions
// @access  Private
exports.getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('questions');
         res.status(200).json(sessions);
       // res.status(200).json({ success: true, sessions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error"
        });
    }
};

// @desc    Get a session by ID with populated questions
// @route   GET /api/sessions/:id
// @access  Private
// @desc    Get a session by ID with populated questions
// @route   GET /api/sessions/:id
// @access  Private
exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate({
                path: "questions",
                options: { 
                    sort: { 
                        isPinned: -1,  // Pinned questions first
                        createdAt: 1   // Then by creation date (oldest first)
                    }
                }
            })
            .exec();

        if (!session) {
            return res.status(404).json({ 
                success: false, 
                message: "Session not found" 
            });
        }

    
        res.status(200).json({ success: true, session });


    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
          // error: error.message  // Added error details for debugging
        });
    }
};
// @desc    Delete a session and its questions
// @route   DELETE /api/sessions/:id
// @access  Private
exports.deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }
       //Check if the logged-in user owns this session
       if(session.user.toString()!=req.user.id){
        return res
        .status(401)
        .json({message:"Not authorized to delete this session"});
       }

        // Delete questions first
        await Question.deleteMany({ session: session._id });

        // Then delete session
        await session.deleteOne();
        res.status(200).json({message:"Session deleted successfully"});

    } catch (error) {
       
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            // error: error.message 
        });
    }
};