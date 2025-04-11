//server/src/routes/pets.js
const express = require('express');

const router = express.Router();

const { 
  createPet, 
  markAsFound,
  getPetsByOwner,
  deletePet 
} = require('../controllers/petsController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPet);
router.get('/', authMiddleware, getPetsByOwner);
router.delete('/:id', authMiddleware, deletePet);
router.post('/:qrId/found', authMiddleware, markAsFound);

module.exports = router;