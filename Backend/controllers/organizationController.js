const Organization = require("../models/Organization");

exports.createOrganization = async (req, res) => {
  try {
    const { name, type, description, website } = req.body;

    const org = new Organization({
      name,
      type,
      description,
      website,
      isVerified: true, // since only admin creates
      createdBy: req.user.id,
    });

    await org.save();

    res.status(201).json({
      message: "Organization created successfully",
      org,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};