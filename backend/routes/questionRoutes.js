const express = require('express');
const { 
  togglePinQuestion, 
  updateQuestionNote, 
  addQuestionsToSession 
} = require('../controllers/questionController');  // Fixed path
const { protect } = require('../middlewares/authMiddleware');  // Fixed import syntax and path

const router = express.Router();

// Add questions to existing session
router.post('/add', protect, addQuestionsToSession);

// Toggle pin status of a question
router.patch('/:id/pin', protect, togglePinQuestion);  // Changed to PATCH and better URL

// Update question notes
router.put('/:id/note', protect, updateQuestionNote);  // Changed to PUT and better URL

module.exports = router;