const asyncHandler = require('express-async-handler');
const Material = require('../models/Material');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public
const getMaterials = asyncHandler(async (req, res) => {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Material.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Material.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit).populate('createdBy', 'name');

    // Executing query
    const materials = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: materials.length,
        pagination,
        data: materials
    });
});

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Public
const getMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id).populate('createdBy', 'name');

    if (!material) {
        res.status(404);
        throw new Error(`Material not found with id of ${req.params.id}`);
    }

    res.status(200).json({
        success: true,
        data: material
    });
});

// @desc    Create new material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const material = await Material.create(req.body);

    res.status(201).json({
        success: true,
        data: material
    });
});

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = asyncHandler(async (req, res) => {
    let material = await Material.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error(`Material not found with id of ${req.params.id}`);
    }

    material = await Material.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: material
    });
});

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = asyncHandler(async (req, res) => {
    const material = await Material.findById(req.params.id);

    if (!material) {
        res.status(404);
        throw new Error(`Material not found with id of ${req.params.id}`);
    }

    await material.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
