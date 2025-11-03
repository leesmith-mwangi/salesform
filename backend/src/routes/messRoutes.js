const express = require('express');
const router = express.Router();
const messController = require('../controllers/messController');

// Mess routes
router.get('/', messController.getAllMesses);
router.get('/:id', messController.getMess);
router.post('/', messController.createMess);
router.put('/:id', messController.updateMess);
router.delete('/:id', messController.deleteMess);

module.exports = router;
