const Attendant = require('../models/Attendant');

// Get all attendants
exports.getAllAttendants = async (req, res, next) => {
  try {
    const attendants = await Attendant.findAll();

    res.json({
      success: true,
      count: attendants.length,
      data: attendants
    });
  } catch (error) {
    next(error);
  }
};

// Get single attendant
exports.getAttendantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendant = await Attendant.findById(id);

    if (!attendant) {
      return res.status(404).json({
        success: false,
        error: 'Attendant not found'
      });
    }

    res.json({
      success: true,
      data: attendant
    });
  } catch (error) {
    next(error);
  }
};

// Get attendants by mess
exports.getAttendantsByMess = async (req, res, next) => {
  try {
    const { messId } = req.params;
    const attendants = await Attendant.findByMess(messId);

    res.json({
      success: true,
      count: attendants.length,
      data: attendants
    });
  } catch (error) {
    next(error);
  }
};

// Create attendant
exports.createAttendant = async (req, res, next) => {
  try {
    const { mess_id, name, phone, role } = req.body;

    // Validation
    if (!mess_id || !name) {
      return res.status(400).json({
        success: false,
        error: 'mess_id and name are required'
      });
    }

    const attendant = await Attendant.create({
      mess_id,
      name,
      phone,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Attendant created successfully',
      data: attendant
    });
  } catch (error) {
    next(error);
  }
};

// Update attendant
exports.updateAttendant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const attendant = await Attendant.update(id, updateData);

    if (!attendant) {
      return res.status(404).json({
        success: false,
        error: 'Attendant not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendant updated successfully',
      data: attendant
    });
  } catch (error) {
    next(error);
  }
};

// Delete attendant
exports.deleteAttendant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendant = await Attendant.delete(id);

    if (!attendant) {
      return res.status(404).json({
        success: false,
        error: 'Attendant not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendant deleted successfully',
      data: attendant
    });
  } catch (error) {
    next(error);
  }
};
