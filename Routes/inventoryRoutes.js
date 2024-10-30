const express = require('express');
const router = express.Router();
const { addOrUpdateInventory,lastProductadded } = require("../Resolvers/inventoryResolver");

// Route to handle adding or updating inventory
router.post('/inventory', addOrUpdateInventory);
router.post('/recentproduct',lastProductadded);

module.exports = router;
