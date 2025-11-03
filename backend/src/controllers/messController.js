const Mess = require('../models/Mess');

// Get all messes
exports.getAllMesses = async (req, res, next) => {
  try {
    const { with_summary } = req.query;

    const messes = with_summary === 'true'
      ? await Mess.getAllWithSummary()
      : await Mess.findAll();

    res.json({
      success: true,
      count: messes.length,
      data: messes
    });
  } catch (error) {
    next(error);
  }
};

// Get single mess
exports.getMess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { with_summary } = req.query;

    const mess = with_summary === 'true'
      ? await Mess.getWithSummary(id)
      : await Mess.findById(id);

    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }

    res.json({
      success: true,
      data: mess
    });
  } catch (error) {
    next(error);
  }
};

// Create mess
exports.createMess = async (req, res, next) => {
  try {
    const { name, location, contact_person, phone } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Check if mess already exists
    const existing = await Mess.findByName(name);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Mess with this name already exists'
      });
    }

    const mess = await Mess.create({
      name,
      location,
      contact_person,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'Mess created successfully',
      data: mess
    });
  } catch (error) {
    next(error);
  }
};

// Update mess
exports.updateMess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, contact_person, phone, is_active } = req.body;

    // Check if mess exists
    const existing = await Mess.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== existing.name) {
      const duplicate = await Mess.findByName(name);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Mess with this name already exists'
        });
      }
    }

    const mess = await Mess.update(id, {
      name,
      location,
      contact_person,
      phone,
      is_active
    });

    res.json({
      success: true,
      message: 'Mess updated successfully',
      data: mess
    });
  } catch (error) {
    next(error);
  }
};

// Delete mess (soft delete)
exports.deleteMess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mess = await Mess.findById(id);
    if (!mess) {
      return res.status(404).json({
        success: false,
        error: 'Mess not found'
      });
    }

    await Mess.delete(id);

    res.json({
      success: true,
      message: 'Mess deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
