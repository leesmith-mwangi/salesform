const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory routes
router.get('/', inventoryController.getAllInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/recent', inventoryController.getRecentAdditions);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.get('/:id', inventoryController.getInventory);
router.post('/', inventoryController.addStock);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

module.exports = router;
