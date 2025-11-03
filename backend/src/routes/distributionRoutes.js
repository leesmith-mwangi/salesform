const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distributionController');

// Distribution routes
router.get('/', distributionController.getAllDistributions);
router.get('/recent', distributionController.getRecentDistributions);
router.get('/summary', distributionController.getDistributionSummary);
router.get('/by-mess-detailed', distributionController.getDetailedDistributionsByMess);
router.get('/mess/:messId', distributionController.getDistributionsByMess);
router.get('/product/:productId', distributionController.getDistributionsByProduct);
router.get('/:id', distributionController.getDistribution);
router.post('/', distributionController.createDistribution);
router.put('/:id', distributionController.updateDistribution);
router.delete('/:id', distributionController.deleteDistribution);

module.exports = router;
