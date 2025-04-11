const express = require('express');
const router = express.Router();
const { createAlert } = require('../controllers/alertsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createAlert);

module.exports = router;