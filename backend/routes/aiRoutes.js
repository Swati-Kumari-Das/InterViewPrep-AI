const express = require('express');
const router = express.Router();
const { generateQuestions } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/generate-questions', protect, generateQuestions);

module.exports = router;
