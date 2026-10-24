const Institute = require("../models/Institute");

const approvedInstitute = async (req, res, next) => {
  try {
    const institute = await Institute.findOne({
      ownerId: req.user._id,
      status: "approved",
    });

    if (!institute) {
      return res
        .status(403)
        .json({ message: "An approved institute account is required" });
    }

    req.institute = institute;
    return next();
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to verify institute access",
        error: error.message,
      });
  }
};

module.exports = approvedInstitute;
