const Department = require("../models/Department");

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, organizationId } = req.body;

    const department = new Department({
      name,
      description,
      organization: organizationId,
      head: req.user.id,
    });

    await department.save();

    res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("organization", "name")
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};