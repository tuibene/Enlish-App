const express = require('express');
const {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
} = require('../controllers/materialController');

const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getMaterials)
    .post(protect, admin, createMaterial);

router.route('/:id')
    .get(getMaterial)
    .put(protect, admin, updateMaterial)
    .delete(protect, admin, deleteMaterial);

module.exports = router;
