const express = require('express');
const { createFeedback } = require('../../controllers/chatcliente.controllers/feedback.controller');
const { verifyTokenOrVisitor } = require('../../middleware/verifyToken');

const router = express.Router();

router.post('/', verifyTokenOrVisitor, createFeedback);

module.exports = router;