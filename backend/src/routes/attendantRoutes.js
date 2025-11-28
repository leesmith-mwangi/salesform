const express = require('express');
const router = express.Router();
const attendantController = require('../controllers/attendantController');

// Attendant routes
router.get('/', attendantController.getAllAttendants);
router.get('/:id', attendantController.getAttendantById);
router.post('/', attendantController.createAttendant);
router.put('/:id', attendantController.updateAttendant);
router.delete('/:id', attendantController.deleteAttendant);

// Mess-specific attendant routes
router.get('/mess/:messId', attendantController.getAttendantsByMess);

module.exports = router;
